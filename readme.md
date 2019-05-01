# Jordan Does Integration Tests On Citadel Packaging

Runs some simple integration tests on [Citadel Packaging](https://www.citadelpackaging.com/).

[Full guide](https://javascriptwebscrapingguy.com/jordan-does-integration-tests-on-citadel-packaging/)

## Getting Started

Clone the repository and run `npm i`. 

After that, you just need to run `npm test`.

I also have this set up to be able to handle a discord webhook. This is to support scheduled, automated testing. When a test fails, it'll push a notification to discord. You just need to rename `.sample.env` to `.env` and then replace the value with your webhook url.  

You can obviously this with any other method (email, slack, etc). It's also set up where if you don't want to use this you don't have to. If it doesn't find a `.env` file or the correct value within that file, it'll just run without sending the notification.

### Prerequisites

Tested on Node v10.15.0 and NPM v6.4.1.

### Installing

After installing [NodeJS](https://nodejs.org/en/) you should be able to just run the following in the terminal.

```
npm i
```

## Built With

* [Puppeteer](https://github.com/GoogleChrome/puppeteer) - Scraping library
* [NodeJS](https://nodejs.org/en/) - NodeJS

## Authors

* **Jordan Hansen** - *Initial work* - [Jordan Hansen](https://github.com/aarmora)


## License

This project is licensed under the ISC License
