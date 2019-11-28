# Forever Whatever Nerdlab Mutation Festival 2019

## Installation

1. install nodejs (https://nodejs.org)
2. install yarn (https://yarnpkg.com/lang/en/docs/install/)
3. in terminal do:

```
yarn install
```

## Usage

`yarn run start`  
start the main app

`yarn run downloader`  
start the yt offline downloader

`yarn run scraper`  
start the yt scraper

`yarn run cleanup`  
cleans any 0 byte file in the ./downloads directory

`yarn run dist`  
build a distribution version of the app (note: not very stable)

## Arduino

the [arduino](./arduino) directory has the simple code for the 2 buttons that can be uploaded to a leonardo compatible board. This allows 2 buttons to behave like keyboard shortcuts (`f` and `w`)
