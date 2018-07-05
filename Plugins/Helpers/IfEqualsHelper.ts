import {HandlebarsHelper, IHandlebarsHelper} from "../HandlebarsEngine";

@HandlebarsHelper('ifEquals')
export class IfEqualsHelper implements IHandlebarsHelper
{
    public handle(context, lvalue, rvalue, options): string
    {
        return lvalue == rvalue ? options.fn(context) : options.inverse(context);
    }
}

@HandlebarsHelper('ifStrictEquals')
export class IfStrictEqualsHelper implements IHandlebarsHelper
{
    public handle(context, lvalue, rvalue, options): string
    {
        return lvalue === rvalue ? options.fn(context) : options.inverse(context);
    }
}

@HandlebarsHelper('ifNotEquals')
export class IfNotEqualsHelper implements IHandlebarsHelper
{
    public handle(context, lvalue, rvalue, options): string
    {
        return lvalue != rvalue ? options.fn(context) : options.inverse(context);
    }
}

@HandlebarsHelper('ifStrictNotEquals')
export class IfStrictNotEqualsHelper implements IHandlebarsHelper
{
    public handle(context, lvalue, rvalue, options): string
    {
        return lvalue !== rvalue ? options.fn(context) : options.inverse(context);
    }
}
