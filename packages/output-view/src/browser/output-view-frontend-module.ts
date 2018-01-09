/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule, interfaces } from "inversify";
import { OutputViewWidget, OUTPUT_VIEW_KIND } from "./output-view-widget";
import { WidgetFactory } from "@theia/core/lib/browser";
import { MenuContribution, CommandContribution } from "@theia/core";
import { OutputViewContribution } from "./output-view-contribution";

export default new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind, isBound: interfaces.IsBound, rebind: interfaces.Rebind) => {
    bind(OutputViewWidget).toSelf();

    bind(WidgetFactory).toDynamicValue(context => ({
        id: OUTPUT_VIEW_KIND,
        createWidget: () => context.container.get<OutputViewWidget>(OutputViewWidget)
    }));

    bind(OutputViewContribution).toSelf().inSingletonScope();
    bind(MenuContribution).toDynamicValue(context => context.container.get<OutputViewContribution>(OutputViewContribution));
    bind(CommandContribution).toDynamicValue(context => context.container.get<OutputViewContribution>(OutputViewContribution));
});
