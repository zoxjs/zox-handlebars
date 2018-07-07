# Handlebars support for Zox.js

```bash
npm i zox zox-plugins zox-handlebars
```

Use handlebars templates:

```handlebars
<div class="article">
    <h1>{{title}}</h1>
    {{#if date}}<p class="date">{{formatDate date 'default'}}</p>{{/if}}
    <div class="body">{{{body}}}</div>
</div>
```

Write custom helpers and decorators:

```ts
@HandlebarsHelper('ifEquals')
export class IfEqualsHelper implements IHandlebarsHelper
{
    public handle(context, lvalue, rvalue, options): string
    {
        return lvalue == rvalue ? options.fn(context) : options.inverse(context);
    }
}
```
