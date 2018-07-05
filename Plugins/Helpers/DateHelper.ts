import {HandlebarsHelper, IHandlebarsHelper} from "../HandlebarsEngine";
import {Dependency} from "zox/lib/ServiceContainer";
import {IDateFormatter} from "zox/lib/Plugins/Services/DateFormatter";

@HandlebarsHelper('formatDate')
export class DateHelper implements IHandlebarsHelper
{
    @Dependency
    protected dateFormatter: IDateFormatter;

    public handle(context, date, format): string
    {
        return this.dateFormatter.formatDate(date, format);
    }
}
