type Quotes = "'" | '"';

// instance methods
declare global {
    interface String {
        toTitleCase(): string;
        quoted(quotes?: Quotes): string;
    }
}

String.prototype.toTitleCase = function toTitleCase(): string {
    if (this.length <= 0) {
        return String(this);
    }

    return this.split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

String.prototype.quoted = function quoted(quotes?: Quotes): string {
    quotes ??= '"';
    return `${quotes}${this}${quotes}`;
};

// static methods
declare global {
    interface StringConstructor {
        quote(str: string): string;
    }
}

String.quote = function quote(str: string, quotes?: Quotes): string {
    return str.quoted(quotes);
};

export {};
