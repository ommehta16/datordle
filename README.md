# Datordle
*A game about states' stats*

## Demo
Datordle is **live** at [ommehta16.github.io/datordle](https://ommehta16.github.io/datordle)!

![demo](./demo.gif)

## How to Play
Your task is to find a particular state. The game will give you hints about said state's stats over the course of the game! For example, you might know that the state is #2 in Education.

Each "guess", you'll enter the name of another state, which will:

Give you how that state fares in each ranking
Show you the rankings for all guessed states in a new category (up to a maximum of 15 categories!)
With enough info, you'll hopefully find out the true state!

## What IS Datordle?
Datordle is a (very loosely) wordle-inspired game that uses US state datasets (instead of words) to help you gauge your "closeness".

We started working on it as part of a project for Algorithms and Data Structures @ PHS, and could've stopped at the CLI...but what fun is that?

## Running Datordle
Just open [`index.html`](/index.html) in your browser! This repo comes with all the numbers pre-crunched (the game is really just a static site!).

If **you** want to re-calculate the numbers (or play the CLI MVP version of the game), ensure you have Java >23, then compile and run Category.java:
```bash
javac Datordle.java; java Datordle;
```

You can add new data csvs to the [`StateData`](/StateData/) folder. The csv may have more than two columns, but only the first two will be used: the first column should be a list of state names, and the second a corresponding list of values. See [`CorporateTax2026.csv`](StateData/CorporateTax2026.csv) for a good example.

## Attributions
This project wouldn't have been possible without public data made available by the [US Census](https://census.gov), [US Department of Education](http://www.ed.gov/data), and [US World News](https://www.usnews.com)