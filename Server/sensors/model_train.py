from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

# Training data
train_data = [
    # LED ON
    ("turn on led", "led_on"),
    ("switch on light", "led_on"),
    ("on led", "led_on"),
    ("light it up", "led_on"),
    ("power on led", "led_on"),
    ("enable light", "led_on"),
    ("led light on", "led_on"),
    ("illuminate led", "led_on"),
    ("start led", "led_on"),
    ("give me light", "led_on"),

    # LED OFF
    ("turn off led", "led_off"),
    ("switch off light", "led_off"),
    ("off led", "led_off"),
    ("shut down light", "led_off"),
    ("disable led", "led_off"),
    ("power off led", "led_off"),
    ("cut off light", "led_off"),
    ("stop led", "led_off"),
    ("turn the light off", "led_off"),
    ("darken led", "led_off"),

    # FAN ON
    ("turn on fan", "fan_on"),
    ("switch on fan", "fan_on"),
    ("start the fan", "fan_on"),
    ("fan on", "fan_on"),
    ("enable fan", "fan_on"),
    ("power on fan", "fan_on"),
    ("fan start", "fan_on"),
    ("rotate fan", "fan_on"),
    ("begin fan", "fan_on"),
    ("fan airflow on", "fan_on"),

    # FAN OFF
    ("turn off fan", "fan_off"),
    ("stop the fan", "fan_off"),
    ("fan off", "fan_off"),
    ("disable fan", "fan_off"),
    ("switch fan off", "fan_off"),
    ("shut down fan", "fan_off"),
    ("power off fan", "fan_off"),
    ("halt fan", "fan_off"),
    ("fan stop", "fan_off"),
    ("cut off fan", "fan_off")
]

# Extract features and labels
X, y = zip(*train_data)

# Create and train the model
model = Pipeline([
    ('vectorizer', CountVectorizer()),
    ('classifier', MultinomialNB())
])
model.fit(X, y)

# Continuous input loop
print("Type a command (e.g., 'turn on fan'). Type 'exit' to quit.\n")
while True:
    user_input = input("You: ").strip().lower()
    if user_input == 'exit':
        print("Exiting command recognizer.")
        break

    prediction = model.predict([user_input])[0]
    print(f"🧠 Predicted Command: {prediction}\n")
