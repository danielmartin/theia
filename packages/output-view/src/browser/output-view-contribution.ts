/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { MenuContribution, CommandContribution, MenuModelRegistry, CommandRegistry, Command } from "@theia/core";
import { WidgetManager, FrontendApplication, CommonMenus } from "@theia/core/lib/browser";
import { inject, injectable, multiInject } from "inversify";
import { OUTPUT_VIEW_KIND, OutputViewWidget } from "./output-view-widget";
import { LanguageClientContribution } from "@theia/languages/lib/browser";

export namespace OutputViewCommands {
    export const OPEN: Command = {
        id: 'outputView:open',
        label: 'Open Output View'
    };
}

@injectable()
export class OutputViewContribution implements CommandContribution, MenuContribution {

    constructor(
        @inject(WidgetManager) protected readonly widgetManager: WidgetManager,
        @inject(FrontendApplication) protected readonly app: FrontendApplication,
        @multiInject(LanguageClientContribution) languageClients: LanguageClientContribution[]) {
    }

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(OutputViewCommands.OPEN, {
            execute: () => this.openOutputView()
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.VIEW, {
            commandId: OutputViewCommands.OPEN.id
        });
    }

    async openOutputView(): Promise<OutputViewWidget> {
        const outputViewWidget = await this.widgetManager.getOrCreateWidget<OutputViewWidget>(OUTPUT_VIEW_KIND);
        if (!outputViewWidget.isAttached) {
            this.app.shell.addToMainArea(outputViewWidget);
        }
        this.app.shell.activateMain(outputViewWidget.id);
        outputViewWidget.update();
        return outputViewWidget;
    }
}
