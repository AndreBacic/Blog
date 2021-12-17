# Why and How to Make Full-Stack App with a Web API with C#

## What is a web API?

Firstly, an API (Application Programming Interface) is just some software that allows two other programs to communicate with each other. Thus, a *Web* API is a program that allows two apps to share data over the internet. These apps may be the front and back ends of a website, but can really run anywhere on the internet.

## Why is a web API useful? Why not MVC or some other architecture?

There are many design patterns, each with their own pros and cons, but the beauty of a Web API is that it cleanly separates the front and back ends of a full-stack web app, such that either could easily be scrapped and replaced with totally different software written in a different language without having to change the other. For example, this blog has a C# + SQL Server back end and a vanilla JavaScript + vanilla CSS front end. I could re-build the entire front end with a Blazor WAsm app, and not have to make any changes to the server-side code. 

Another consequence of this clean separation is that many different types can easily use each other. For example, I could keep the JS front end and then in addition to the Blazor app code a mobile app so they all consume the same back end through the same Web API at the same time, and in all that I still wouldn't have to change that API or the server-side code.

## How does one program a web API?

## How can the front-end use this new web API?