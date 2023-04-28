import { Text } from '@codemirror/state';

export const countWords = (document: Text) =>
    document
        .toJSON()
        .reduce(
            (previous, current) =>
                previous +
                (current ? current.split(' ').filter(Boolean).length : 0),
            0,
        );
