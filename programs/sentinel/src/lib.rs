use anchor_lang::prelude::*;
use anchor_spl::token;

declare_id!("9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu");

#[program]
pub mod sentinel {
    use super::*;

    /// Initialize the Sentinel registry for a user
    pub fn initialize_registry(
        ctx: Context<InitializeRegistry>,
        bump: u8,
    ) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.owner = ctx.accounts.owner.key();
        registry.bump = bump;
        registry.active_subscriptions = 0;
        registry.total_alerts_triggered = 0;
        registry.created_at = Clock::get()?.unix_timestamp;
        
        emit!(RegistryInitialized {
            owner: ctx.accounts.owner.key(),
            timestamp: registry.created_at,
        });

        Ok(())
    }

    /// Create a new token subscription with alert thresholds
    pub fn create_subscription(
        ctx: Context<CreateSubscription>,
        token_mint: Pubkey,
        risk_threshold: u16,
        price_threshold: u32,
    ) -> Result<()> {
        require!(risk_threshold <= 100, SentinelError::InvalidThreshold);
        require!(price_threshold > 0, SentinelError::InvalidThreshold);

        let subscription = &mut ctx.accounts.subscription;
        subscription.owner = ctx.accounts.owner.key();
        subscription.token_mint = token_mint;
        subscription.risk_threshold = risk_threshold;
        subscription.price_threshold = price_threshold;
        subscription.status = SubscriptionStatus::Active;
        subscription.alerts_triggered = 0;
        subscription.created_at = Clock::get()?.unix_timestamp;
        subscription.last_alert_at = 0;

        let registry = &mut ctx.accounts.registry;
        registry.active_subscriptions += 1;

        emit!(SubscriptionCreated {
            subscription: ctx.accounts.subscription.key(),
            owner: ctx.accounts.owner.key(),
            token_mint,
            risk_threshold,
            price_threshold,
        });

        Ok(())
    }

    /// Update subscription thresholds
    pub fn update_subscription(
        ctx: Context<UpdateSubscription>,
        new_risk_threshold: u16,
        new_price_threshold: u32,
    ) -> Result<()> {
        require!(new_risk_threshold <= 100, SentinelError::InvalidThreshold);
        require!(new_price_threshold > 0, SentinelError::InvalidThreshold);

        let subscription = &mut ctx.accounts.subscription;
        subscription.risk_threshold = new_risk_threshold;
        subscription.price_threshold = new_price_threshold;

        emit!(SubscriptionUpdated {
            subscription: ctx.accounts.subscription.key(),
            new_risk_threshold,
            new_price_threshold,
        });

        Ok(())
    }

    /// Pause a subscription
    pub fn pause_subscription(ctx: Context<PauseSubscription>) -> Result<()> {
        let subscription = &mut ctx.accounts.subscription;
        require!(
            subscription.status == SubscriptionStatus::Active,
            SentinelError::InvalidSubscriptionStatus
        );

        subscription.status = SubscriptionStatus::Paused;

        let registry = &mut ctx.accounts.registry;
        if registry.active_subscriptions > 0 {
            registry.active_subscriptions -= 1;
        }

        emit!(SubscriptionPaused {
            subscription: ctx.accounts.subscription.key(),
        });

        Ok(())
    }

    /// Resume a paused subscription
    pub fn resume_subscription(ctx: Context<ResumeSubscription>) -> Result<()> {
        let subscription = &mut ctx.accounts.subscription;
        require!(
            subscription.status == SubscriptionStatus::Paused,
            SentinelError::InvalidSubscriptionStatus
        );

        subscription.status = SubscriptionStatus::Active;

        let registry = &mut ctx.accounts.registry;
        registry.active_subscriptions += 1;

        emit!(SubscriptionResumed {
            subscription: ctx.accounts.subscription.key(),
        });

        Ok(())
    }

    /// Cancel a subscription
    pub fn cancel_subscription(ctx: Context<CancelSubscription>) -> Result<()> {
        let subscription = &mut ctx.accounts.subscription;
        require!(
            subscription.status != SubscriptionStatus::Cancelled,
            SentinelError::SubscriptionAlreadyCancelled
        );

        if subscription.status == SubscriptionStatus::Active {
            let registry = &mut ctx.accounts.registry;
            if registry.active_subscriptions > 0 {
                registry.active_subscriptions -= 1;
            }
        }

        subscription.status = SubscriptionStatus::Cancelled;

        emit!(SubscriptionCancelled {
            subscription: ctx.accounts.subscription.key(),
        });

        Ok(())
    }

    /// Trigger an alert when thresholds are breached
    pub fn trigger_alert(
        ctx: Context<TriggerAlert>,
        current_risk_score: u16,
        price_change_percent: i32,
        alert_message: String,
    ) -> Result<()> {
        require!(current_risk_score <= 100, SentinelError::InvalidRiskScore);
        require!(alert_message.len() <= 256, SentinelError::MessageTooLong);

        // Capture keys before mutable borrows
        let subscription_key = ctx.accounts.subscription.key();
        let owner_key = ctx.accounts.owner.key();

        let subscription = &mut ctx.accounts.subscription;
        require!(
            subscription.status == SubscriptionStatus::Active,
            SentinelError::SubscriptionNotActive
        );

        // Check if thresholds are breached
        let risk_breached = current_risk_score >= subscription.risk_threshold;
        let price_breached = price_change_percent.abs() as u32 >= subscription.price_threshold;

        require!(
            risk_breached || price_breached,
            SentinelError::ThresholdsNotBreached
        );

        // Capture alert key before mutable borrow
        let alert_key = ctx.accounts.alert.key();

        let alert = &mut ctx.accounts.alert;
        alert.subscription = subscription_key;
        alert.owner = owner_key;
        alert.token_mint = subscription.token_mint;
        alert.risk_score = current_risk_score;
        alert.price_change = price_change_percent;
        alert.message = alert_message;
        alert.status = AlertStatus::Triggered;
        alert.triggered_at = Clock::get()?.unix_timestamp;
        alert.delivered_at = 0;

        subscription.alerts_triggered += 1;
        subscription.last_alert_at = alert.triggered_at;

        let registry = &mut ctx.accounts.registry;
        registry.total_alerts_triggered += 1;

        emit!(AlertTriggered {
            alert: alert_key,
            subscription: subscription_key,
            owner: owner_key,
            risk_score: current_risk_score,
            price_change: price_change_percent,
            timestamp: alert.triggered_at,
        });

        Ok(())
    }

    /// Mark an alert as delivered
    pub fn confirm_alert_delivery(ctx: Context<ConfirmAlertDelivery>) -> Result<()> {
        let alert_key = ctx.accounts.alert.key();
        let alert = &mut ctx.accounts.alert;
        require!(
            alert.status == AlertStatus::Triggered,
            SentinelError::InvalidAlertStatus
        );

        alert.status = AlertStatus::Delivered;
        alert.delivered_at = Clock::get()?.unix_timestamp;

        emit!(AlertDelivered {
            alert: alert_key,
            delivered_at: alert.delivered_at,
        });

        Ok(())
    }

    /// Mark an alert as failed
    pub fn mark_alert_failed(ctx: Context<MarkAlertFailed>, reason: String) -> Result<()> {
        require!(reason.len() <= 256, SentinelError::MessageTooLong);

        let alert_key = ctx.accounts.alert.key();
        let alert = &mut ctx.accounts.alert;
        require!(
            alert.status == AlertStatus::Triggered,
            SentinelError::InvalidAlertStatus
        );

        alert.status = AlertStatus::Failed;
        alert.delivered_at = Clock::get()?.unix_timestamp;

        emit!(AlertFailed {
            alert: alert_key,
            reason,
            timestamp: alert.delivered_at,
        });

        Ok(())
    }

    /// Create an attestation record for verified analysis
    pub fn create_attestation(
        ctx: Context<CreateAttestation>,
        token_mint: Pubkey,
        risk_score: u16,
        analysis_hash: [u8; 32],
    ) -> Result<()> {
        require!(risk_score <= 100, SentinelError::InvalidRiskScore);

        let attestation = &mut ctx.accounts.attestation;
        attestation.creator = ctx.accounts.creator.key();
        attestation.token_mint = token_mint;
        attestation.risk_score = risk_score;
        attestation.analysis_hash = analysis_hash;
        attestation.created_at = Clock::get()?.unix_timestamp;

        emit!(AttestationCreated {
            attestation: ctx.accounts.attestation.key(),
            token_mint,
            risk_score,
        });

        Ok(())
    }
}

// ============================================================================
// Account Structures
// ============================================================================

#[account]
pub struct Registry {
    pub owner: Pubkey,
    pub bump: u8,
    pub active_subscriptions: u32,
    pub total_alerts_triggered: u64,
    pub created_at: i64,
}

#[account]
pub struct Subscription {
    pub owner: Pubkey,
    pub token_mint: Pubkey,
    pub risk_threshold: u16,
    pub price_threshold: u32,
    pub status: SubscriptionStatus,
    pub alerts_triggered: u32,
    pub created_at: i64,
    pub last_alert_at: i64,
}

#[account]
pub struct Alert {
    pub subscription: Pubkey,
    pub owner: Pubkey,
    pub token_mint: Pubkey,
    pub risk_score: u16,
    pub price_change: i32,
    pub message: String,
    pub status: AlertStatus,
    pub triggered_at: i64,
    pub delivered_at: i64,
}

#[account]
pub struct Attestation {
    pub creator: Pubkey,
    pub token_mint: Pubkey,
    pub risk_score: u16,
    pub analysis_hash: [u8; 32],
    pub created_at: i64,
}

// ============================================================================
// Enums
// ============================================================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum SubscriptionStatus {
    Active,
    Paused,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum AlertStatus {
    Triggered,
    Delivered,
    Failed,
}

// ============================================================================
// Context Structures
// ============================================================================

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct InitializeRegistry<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 1 + 4 + 8 + 8,
        seeds = [b"registry", owner.key().as_ref()],
        bump
    )]
    pub registry: Account<'info, Registry>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateSubscription<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 32 + 2 + 4 + 1 + 4 + 8 + 8,
    )]
    pub subscription: Account<'info, Subscription>,
    #[account(mut, seeds = [b"registry", owner.key().as_ref()], bump = registry.bump)]
    pub registry: Account<'info, Registry>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateSubscription<'info> {
    #[account(mut, has_one = owner)]
    pub subscription: Account<'info, Subscription>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct PauseSubscription<'info> {
    #[account(mut, has_one = owner)]
    pub subscription: Account<'info, Subscription>,
    #[account(mut, seeds = [b"registry", owner.key().as_ref()], bump = registry.bump)]
    pub registry: Account<'info, Registry>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResumeSubscription<'info> {
    #[account(mut, has_one = owner)]
    pub subscription: Account<'info, Subscription>,
    #[account(mut, seeds = [b"registry", owner.key().as_ref()], bump = registry.bump)]
    pub registry: Account<'info, Registry>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelSubscription<'info> {
    #[account(mut, has_one = owner)]
    pub subscription: Account<'info, Subscription>,
    #[account(mut, seeds = [b"registry", owner.key().as_ref()], bump = registry.bump)]
    pub registry: Account<'info, Registry>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct TriggerAlert<'info> {
    #[account(init, payer = owner, space = 8 + 32 + 32 + 32 + 2 + 4 + 256 + 1 + 8 + 8)]
    pub alert: Account<'info, Alert>,
    #[account(mut, has_one = owner)]
    pub subscription: Account<'info, Subscription>,
    #[account(mut, seeds = [b"registry", owner.key().as_ref()], bump = registry.bump)]
    pub registry: Account<'info, Registry>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ConfirmAlertDelivery<'info> {
    #[account(mut)]
    pub alert: Account<'info, Alert>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct MarkAlertFailed<'info> {
    #[account(mut)]
    pub alert: Account<'info, Alert>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct CreateAttestation<'info> {
    #[account(init, payer = creator, space = 8 + 32 + 32 + 2 + 32 + 8)]
    pub attestation: Account<'info, Attestation>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// ============================================================================
// Events
// ============================================================================

#[event]
pub struct RegistryInitialized {
    pub owner: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct SubscriptionCreated {
    pub subscription: Pubkey,
    pub owner: Pubkey,
    pub token_mint: Pubkey,
    pub risk_threshold: u16,
    pub price_threshold: u32,
}

#[event]
pub struct SubscriptionUpdated {
    pub subscription: Pubkey,
    pub new_risk_threshold: u16,
    pub new_price_threshold: u32,
}

#[event]
pub struct SubscriptionPaused {
    pub subscription: Pubkey,
}

#[event]
pub struct SubscriptionResumed {
    pub subscription: Pubkey,
}

#[event]
pub struct SubscriptionCancelled {
    pub subscription: Pubkey,
}

#[event]
pub struct AlertTriggered {
    pub alert: Pubkey,
    pub subscription: Pubkey,
    pub owner: Pubkey,
    pub risk_score: u16,
    pub price_change: i32,
    pub timestamp: i64,
}

#[event]
pub struct AlertDelivered {
    pub alert: Pubkey,
    pub delivered_at: i64,
}

#[event]
pub struct AlertFailed {
    pub alert: Pubkey,
    pub reason: String,
    pub timestamp: i64,
}

#[event]
pub struct AttestationCreated {
    pub attestation: Pubkey,
    pub token_mint: Pubkey,
    pub risk_score: u16,
}

// ============================================================================
// Errors
// ============================================================================

#[error_code]
pub enum SentinelError {
    #[msg("Invalid threshold value")]
    InvalidThreshold,
    #[msg("Invalid subscription status")]
    InvalidSubscriptionStatus,
    #[msg("Subscription already cancelled")]
    SubscriptionAlreadyCancelled,
    #[msg("Subscription is not active")]
    SubscriptionNotActive,
    #[msg("Invalid risk score")]
    InvalidRiskScore,
    #[msg("Message is too long")]
    MessageTooLong,
    #[msg("Thresholds not breached")]
    ThresholdsNotBreached,
    #[msg("Invalid alert status")]
    InvalidAlertStatus,
}
