import { Text } from "@codemirror/state";

export const countWords = (document: Text) =>
    document
        .toJSON()
        .reduce((accumulator, line) => accumulator + (line.match(/\S+/g)?.length ?? 0), 0);
