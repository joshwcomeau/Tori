##Introducing Tori

> New Social Network.

> Messages are all Haikus.

> Built with Meteor.

---
### Haiku Templates
I've done by best to reuse templates. For example, there are three places with
Haiku lists:

* A user's profile page
* My home feed
* Special lists, like Best Of.

Each list will have its own subscription, but will reuse the same HTML. This is done by nesting.

Each of the above examples has a parent template that holds any non-Haiku stuff (headers, styles, etc). They all have their own helper, `haikus`, which is a cursor of the haikus needed to form this list. They invoke the child template, `haikusList`, with this cursor:

```
<div class="card home-feed">
  {{> haikusList haikus}}
</div>
```

`haikusList`, defined in `/client/templates/haiku/haikus_list`, iterates through the cursor provided, and creates a `<li>` for each `haiku`, a child template.

Because the same Haiku may appear or react differently depending on the context, I'm relying on CSS and FlowRouter.

- For cosmetics (let's say Haikus on the home feed need to be bigger), we can rely on the fact that `.haiku` is nested within `.home-feed`.
- For behaviour. we can get the path using FlowRouter, and helpers can be constructed around that. If we want to display the ranking only on the Best Of page, we can add the HTML to the shared `haiku` template, but wrap it in a conditional helper:

```
// haiku.js
Template.haiku.helpers({
  ...
  showRanking: (ev, instance) => FlowRouter.getRouteName() === 'bestOf',
  ...
});

// haiku.html
<template name="haiku">
  ...
  {{#if showRanking}}
    <div class="ranking">{{ranking}}</div>
  {{/if}}
  ...
</template>

```
