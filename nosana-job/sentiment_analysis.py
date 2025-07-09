import sys
import json
import random
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

def get_human_readable_summary(score):
    if score > 0.6:
        return 'Overwhelmingly Positive'
    elif score > 0.2:
        return 'Positive'
    elif score < -0.6:
        return 'Highly Negative'
    elif score < -0.2:
        return 'Negative'
    else:
        return 'Mixed'

def main():
    # Nosana passes job inputs as a JSON string via stdin
    try:
        inputs = json.load(sys.stdin)
        token_symbol = inputs.get("symbol", "UNKNOWN")
    except (json.JSONDecodeError, IndexError):
        token_symbol = "UNKNOWN"

    # --- Placeholder for real social media scraping ---
    # In a real-world scenario, you would use the token_symbol to scrape
    # recent tweets, Telegram messages, or other social data.
    # For this example, we generate a random sentiment score to simulate the process.
    #
    # Example scraping logic (conceptual):
    # recent_tweets = scrape_tweets(f"${token_symbol} token")
    # text_to_analyze = " ".join(recent_tweets)
    #
    # analyzer = SentimentIntensityAnalyzer()
    # sentiment = analyzer.polarity_scores(text_to_analyze)
    # compound_score = sentiment['compound']

    # Using mock data for now:
    compound_score = random.uniform(-1.0, 1.0)
    
    summary = get_human_readable_summary(compound_score)
    
    # The output MUST be a JSON object printed to stdout
    output = {
        "compound": round(compound_score, 4),
        "summary": summary,
        "token_symbol": token_symbol # Including for good measure
    }
    
    print(json.dumps(output))

if __name__ == "__main__":
    main()
