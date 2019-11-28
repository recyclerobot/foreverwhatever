#include "Keyboard.h"

// Button "f"
const int buttonPin1 = 4;
int buttonState1;
int lastButtonState1 = HIGH;
unsigned long lastDebounceTime1 = 0;
unsigned long debounceDelay1 = 50;

// Button "w"
const int buttonPin2 = 5;
int buttonState2;
int lastButtonState2 = HIGH;
unsigned long lastDebounceTime2 = 0;
unsigned long debounceDelay2 = 50;

void setup() {
  // make the pushButton pin an input:
  pinMode(buttonPin1, INPUT);
  pinMode(buttonPin2, INPUT);
  // initialize control over the keyboard:
  Keyboard.begin();
}

void loop() {
  int reading1 = digitalRead(buttonPin1);
  int reading2 = digitalRead(buttonPin2);

  if (reading1 != lastButtonState1) {
    lastDebounceTime1 = millis();
  }
  if (reading2 != lastButtonState2) {
    lastDebounceTime2 = millis();
  }

  if ((millis() - lastDebounceTime1) > debounceDelay1) {
    if (reading1 != buttonState1) {
      buttonState1 = reading1;
      if (buttonState1 == HIGH) {
        Keyboard.print("f");
      }
    }
  }
  if ((millis() - lastDebounceTime2) > debounceDelay2) {
    if (reading2 != buttonState2) {
      buttonState2 = reading2;
      if (buttonState2 == HIGH) {
        Keyboard.print("z");
      }
    }
  }
  
  lastButtonState1 = reading1;
  lastButtonState2 = reading2;
}