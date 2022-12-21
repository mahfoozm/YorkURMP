import { RequestDocument } from './types';
export declare function resolveRequestDocument(document: RequestDocument): {
    query: string;
    operationName?: string;
};
