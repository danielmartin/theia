/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable } from "inversify";
import { VirtualWidget, VirtualRenderer, Message } from "@theia/core/lib/browser";
import { VirtualElement, h } from "@phosphor/virtualdom";
import { ObservableOutputChannel } from "@theia/languages/lib/common/observable-output-channel";
import { ObservableOutputChannelManager } from "@theia/languages/lib/common";

import "../../src/browser/style/output-view.css";

export const OUTPUT_VIEW_KIND = 'outputView';

@injectable()
export class OutputViewWidget extends VirtualWidget {

    private selectedChannel: ObservableOutputChannel;

    constructor( @inject(ObservableOutputChannelManager) protected readonly outputChannelManager: ObservableOutputChannelManager) {
        super();
        this.id = OUTPUT_VIEW_KIND;
        this.title.label = 'Output';
        this.title.iconClass = 'fa fa-flag';
        this.title.closable = true;
        this.addClass('theia-output-view');
        outputChannelManager.getChannels().forEach(this.registerListener.bind(this));
        outputChannelManager.onChannelAdded(channel => {
            this.registerListener(channel);
            this.update();
        });
    }

    protected registerListener(outputChannel: ObservableOutputChannel) {
        if (!this.selectedChannel) {
            this.selectedChannel = outputChannel;
        }
        outputChannel.onContentChange(c => {
            if (outputChannel === this.selectedChannel) {
                this.update();
            }
        });
    }

    render(): VirtualElement[] {
        return [this.renderChannelSelector(), this.renderChannelContents()];
    }

    protected renderChannelContents(): VirtualElement {
        if (this.selectedChannel) {
            return h.div(
                { id: 'outputContents' },
                VirtualRenderer.flatten(this.selectedChannel.getLines().map(line => this.toHtmlText(line))));
        } else {
            return h.div({ id: 'outputContents' });
        }
    }

    protected toHtmlText(text: string): VirtualElement[] {
        const result: VirtualElement[] = [];
        if (text) {
            const lines = text.split(/([\n\r]+)/);
            for (const line of lines) {
                result.push(h.div(line));
            }
        }
        return result;
    }

    protected renderChannelSelector(): VirtualElement {
        const channelOptionElements: h.Child[] = [];
        this.outputChannelManager.getChannelNames().forEach(channelName => {
            channelOptionElements.push(h.option({ value: channelName }, channelName));
        });

        return h.select({
            id: 'outputChannelList',
            onchange: async event => {
                const channelName = (event.target as HTMLSelectElement).value;
                this.selectedChannel = this.outputChannelManager.getChannel(channelName);
                this.update();
            }
        }, VirtualRenderer.flatten(channelOptionElements));
    }

    protected onUpdateRequest(msg: Message) {
        super.onUpdateRequest(msg);
        setTimeout(() => {
            const div = document.getElementById(this.id) as HTMLDivElement;
            if (div && div.children.length > 0) {
                div.children[div.children.length - 1].scrollIntoView(false);
            }
        });
    }
}
