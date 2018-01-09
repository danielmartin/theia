/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { OutputChannel, Emitter, Event } from "./languageclient-services";
import { injectable } from "inversify";

@injectable()
export class ObservableOutputChannelManager {
    protected readonly channels = new Map<string, ObservableOutputChannel>();

    private readonly channelAddedEmitter = new Emitter<ObservableOutputChannel>();
    readonly onChannelAdded = this.channelAddedEmitter.event;

    getChannel(name: string): ObservableOutputChannel {
        const existing = this.channels.get(name);
        if (existing) {
            return existing;
        }
        const channel = new ObservableOutputChannel();
        this.channels.set(name, channel);
        this.channelAddedEmitter.fire(channel);
        return channel;
    }

    getChannels(): ObservableOutputChannel[] {
        return Array.from(this.channels.values());
    }

    getChannelNames(): string[] {
        return Array.from(this.channels.keys());
    }
}

export class ObservableOutputChannel implements OutputChannel {

    private readonly contentChangeEmitter = new Emitter<ObservableOutputChannel>();
    private lines: string[] = [];
    private currentLine: string | undefined;

    readonly onContentChange: Event<ObservableOutputChannel> = this.contentChangeEmitter.event;
    maxLines = 20;

    append(value: string): void {
        this.currentLine += value;
        this.contentChangeEmitter.fire(this);
    }

    appendLine(line: string): void {
        if (this.currentLine !== undefined) {
            this.lines.push(this.currentLine + line);
            this.currentLine = undefined;
        } else {
            this.lines.push(line);
        }
        if (this.lines.length > this.maxLines) {
            this.lines.splice(0, this.lines.length - this.maxLines);
        }
        this.contentChangeEmitter.fire(this);
    }

    show(preserveFocus?: boolean | undefined): void {
        // no-op
    }

    getLines(): string[] {
        if (this.currentLine !== undefined) {
            return [...this.lines, this.currentLine];
        } else {
            return this.lines;
        }
    }
}
