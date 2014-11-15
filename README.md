A/B Test Server
==============

This is a server that keeps track of AB tests. Clients communicate over a REST based API. It is written in Node.js, using Express4.

# The basics
AB testing for websites and apps, sometimes also referred to as split testing, is a statistical test method to compare 
the relative effectiveness of two different alternatives. Typical examples include measuring which wording or display 
leads to most sign-ups, or click-throughs in an online campaign. It can also be used on web sites to compare
 page layouts, headlines and more.
 
In A/B testing, there are always exactly two alternatives (variants) that are being tested against each other. 
The name derives from the fact that each variant is referred to as A and B, so A/B testing. *You can only run one test 
per page at any point in time.* If you mix multiple tests on one page, the test results are not reliable. 
Basically, the math behind it only works if the test is running independently of any other test.

The result of a test is that one of the two alternatives is found to be *likely* better than the other.
The result is always an interval with an error margin. When the error margin is small enough, it is said to be a
significant difference, with some degree of confidence that the result is correct. *This server uses a 95% confidence
 interval to call a test result significant*. Worded differently, a test is said to have significant difference between 
 alternatives A and B, when a 95% confidence interval is achieved.
 
*To achieve 95% degree of confidence, a test need to collect about 1000 clicks.*

**Typical setup**

*TEST: "Sign up now and get 10% off!" is more efficient than "Sign up now and win a hamster!"*

|Variant |Views| Conversions|
|:-------|:---:|:----------:|
|A| 1000 | 230 |
|B| 1003 | 450 | 

The server will keep track of the progress of the test. You need to supply the view and conversion events (REST calls).



## Key concepts
To understand how to use the REST API, it will be very helpful to be familiar with some terminology.

- *Null hypothesis:*  This is the actual test. Example: "Showing a teaser with an image leads to more click-throughs than showing a teaser with only text.
- *Variant:*  There are always two variants that are being tested. Normally referred to as A and B.
- *Conversion:*  Conversion is the success action that counts towards a variant. Example conversion: 


# Usage
This is how you use the API. See __./test/test-REST-api.js__ for code examples.

## Create a new test
Make a HTTP PUT call to http://<yourhost:port>/tests

The server will respond with a JSON object containing the ```testID``` property. Use the testID in subsequent calls to 
register views and conversions on the variants.

Example response:

```Javascript
{ testID: 't01415997289263' }
```

## Get status of a test
Make a HTTP GET call to http://<yourhost:port>/tests/<test id>

The server will respond with a JSON object containing the current counts for views and conversions, along with information
about the test result (if it is significant etc).

Example response (only showing relevant properties):

```Javascript
{ testID: 't11415994525154',
  variantViews: [ 0, 2 ],
  conversions: [ 0, 1 ],
  stats:
   { isSignificant: false,
     isSignificantForA: false,
     isSignificantForB: false,
     changePercent: null,
     probabilityOfB: null } }
```

## Counting up views
The A and B variants are indicated with 0 and 1 and you HTTP POST to the respective view to add view events for 
the variants in a test.

Example: Adding a view to variant A:

POST to http://<yourhost:port>/tests/<test id>/view/0


Example: Adding a view to variant B:

POST to http://<yourhost:port>/tests/<test id>/view/1

Example response (only showing relevant properties):

```Javascript
{ testID: 't21415997386400',
      variantViews: [ 1, 0 ],
      conversions: [ 0, 0 ]
}
```
      


## Counting up conversions
The A and B variants are indicated as 0 and 1 and you HTTP POST to the respective conversion to add events.

Example: Adding a conversion to variant A:

POST to http://<yourhost:port>/tests/<test id>/convert/0


Example: Adding a conversion to variant B:

POST to http://<yourhost:port>/tests/<test id>/convert/1


Example response (only showing relevant properties):

```Javascript
{ testID: 't31415997462875',
  variantViews: [ 0, 0 ],
  conversions: [ 1, 0 ]
}
```
  
  

# Installation
- Clone this repo
- ```npm install```

# Running the tests
- ```npm test```

# Starting server on http://localhost:8080 (default config)
- ```npm start```

The actual start script is located in __./bin/wwww__

# Changing configuration 
See file __./conf__ folder. There are two sets of configurations, one default set and then a set used for the unit tests.



## Notes
- Currently the server uses an in-memory database, so all test data are lost upon server restart. 
-- It is possible to change to a persistent storage by changing the file __./lib/datasource.js__


