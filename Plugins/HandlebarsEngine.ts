import * as Handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";
import {Constructor, PluginDefinition, PluginSetup} from "zox-plugins";
import {IRenderEngine, RenderEngine} from "zox/lib/Plugins/PluginManagers/RenderEnginePluginManager";
import {Dependency, IOnResolved, IServiceContainer} from "zox/lib/ServiceContainer";
import {IConfigService} from "zox/lib/Services/ConfigService";
import {IPluginDiscoveryService} from "zox/lib/Services/PluginDiscoveryService";
import {listFilesSync} from "zox/lib/Utility";
import {watch} from "zox/lib/Misc/FileWatch";

const helperPluginKey = Symbol('Handlebars Helper');
const decoratorPluginKey = Symbol('Handlebars Decorator');

type HandlebarsOptions = {
    compile?: CompileOptions
    partials?: string
}

export interface IHandlebarsHelper
{
    handle(context, ...args): any;
}

export interface IHandlebarsDecorator
{
    decorate(
        program: Handlebars.TemplateDelegate,
        props: any,
        container: any,
        context: any
    ): Handlebars.TemplateDelegate;
}

@RenderEngine('hbs', 'handlebars')
export class HandlebarsEngine implements IRenderEngine, IOnResolved
{
    @Dependency
    protected container: IServiceContainer;

    @Dependency
    protected config: IConfigService;

    @Dependency
    protected pluginDiscovery: IPluginDiscoveryService;

    private options: CompileOptions;

    private readonly handlebars: typeof Handlebars = Handlebars.create();

    private get helperPluginDefinitions(): Array<PluginDefinition<Constructor<IHandlebarsHelper>, string>>
    {
        return this.pluginDiscovery.getPlugins(helperPluginKey);
    }

    private get decoratorPluginDefinitions(): Array<PluginDefinition<Constructor<IHandlebarsDecorator>, string>>
    {
        return this.pluginDiscovery.getPlugins(decoratorPluginKey);
    }

    public onResolved(): void
    {
        const config: HandlebarsOptions = this.config.getConfig('handlebars');
        this.options = config.compile;
        for (const helper of this.helperPluginDefinitions)
        {
            const instance = this.container.create(helper.pluginClass);
            this.handlebars.registerHelper(helper.data, wrapHelper(instance));
        }
        for (const decorator of this.decoratorPluginDefinitions)
        {
            const instance = this.container.create(decorator.pluginClass);
            this.handlebars.registerDecorator(decorator.data, instance.decorate.bind(instance));
        }
        if (config.partials)
        {
            const partialFiles = listFilesSync(config.partials);
            for (const partialFile of partialFiles)
            {
                const ext = path.extname(partialFile);
                if (ext === '.hbs' || ext === '.handlebars')
                {
                    const name = path.relative(config.partials, partialFile.slice(0, -ext.length));
                    const partial = fs.readFileSync(partialFile, 'utf8');
                    this.handlebars.registerPartial(name, partial);
                }
            }
            if (this.config.getGlobalConfig().watch)
            {
                watch(config.partials, (e) => {
                    const ext = path.extname(e.info.filePath);
                    if (ext === '.hbs' || ext === '.handlebars')
                    {
                        const name = path.relative(config.partials, e.info.filePath.slice(0, -ext.length));
                        let partial;
                        switch (e.event)
                        {
                            case 'added':
                            case 'changed':
                                partial = fs.readFileSync(e.info.filePath, 'utf8');
                                this.handlebars.registerPartial(name, partial);
                                break;
                            case 'removed':
                                this.handlebars.unregisterPartial(name);
                                break;
                        }
                    }
                }, 500);
            }
        }
    }

    public compile(template: string): (data) => string
    {
        return this.handlebars.compile(template, this.options);
    }
}

function wrapHelper(instance: IHandlebarsHelper): (context, ...args) => any
{
    return function wrappedHelper() { return instance.handle(this, ...arguments); };
}

export function HandlebarsHelper(name: string)
{
    return PluginSetup<IHandlebarsHelper>(helperPluginKey, name);
}

export function HandlebarsDecorator(name: string)
{
    return PluginSetup<IHandlebarsDecorator>(decoratorPluginKey, name);
}
