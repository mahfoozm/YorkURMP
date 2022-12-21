import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { DocumentNode } from 'graphql/language/ast';
import type { GraphQLError } from 'graphql/error/GraphQLError';
import * as Dom from './types.dom';
export type { GraphQLError };
export declare type Variables = {
    [key: string]: any;
};
export declare type RemoveIndex<T> = {
    [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};
export interface GraphQLResponse<T = any> {
    data?: T;
    errors?: GraphQLError[];
    extensions?: any;
    status: number;
    [key: string]: any;
}
export interface GraphQLRequestContext<V extends Variables = Variables> {
    query: string | string[];
    variables?: V;
}
export declare class ClientError extends Error {
    response: GraphQLResponse;
    request: GraphQLRequestContext;
    constructor(response: GraphQLResponse, request: GraphQLRequestContext);
    private static extractMessage;
}
export declare type MaybeFunction<T> = T | (() => T);
export declare type RequestDocument = string | DocumentNode;
export interface Response<T> {
    data: T;
    extensions?: any;
    headers: Dom.Headers;
    errors?: GraphQLError[];
    status: number;
}
export declare type PatchedRequestInit = Omit<Dom.RequestInit, 'headers'> & {
    headers?: MaybeFunction<Dom.RequestInit['headers']>;
    requestMiddleware?: RequestMiddleware;
    responseMiddleware?: (response: Response<unknown> | Error) => void;
};
export declare type BatchRequestDocument<V extends Variables = Variables> = {
    document: RequestDocument;
    variables?: V;
};
export declare type RawRequestOptions<V extends Variables = Variables> = {
    query: string;
    requestHeaders?: Dom.RequestInit['headers'];
    signal?: Dom.RequestInit['signal'];
} & (V extends Record<any, never> ? {
    variables?: V;
} : keyof RemoveIndex<V> extends never ? {
    variables?: V;
} : {
    variables: V;
});
export declare type RequestOptions<V extends Variables = Variables, T = any> = {
    document: RequestDocument | TypedDocumentNode<T, V>;
    requestHeaders?: Dom.RequestInit['headers'];
    signal?: Dom.RequestInit['signal'];
} & (V extends Record<any, never> ? {
    variables?: V;
} : keyof RemoveIndex<V> extends never ? {
    variables?: V;
} : {
    variables: V;
});
export declare type BatchRequestsOptions<V extends Variables = Variables> = {
    documents: BatchRequestDocument<V>[];
    requestHeaders?: Dom.RequestInit['headers'];
    signal?: Dom.RequestInit['signal'];
};
export declare type RequestExtendedOptions<V extends Variables = Variables, T = any> = {
    url: string;
} & RequestOptions<V, T>;
export declare type RawRequestExtendedOptions<V extends Variables = Variables> = {
    url: string;
} & RawRequestOptions<V>;
export declare type BatchRequestsExtendedOptions<V extends Variables = Variables> = {
    url: string;
} & BatchRequestsOptions<V>;
export declare type RequestMiddleware<V extends Variables = Variables> = (request: RequestExtendedInit<V>) => RequestExtendedInit | Promise<RequestExtendedInit>;
declare type RequestExtendedInit<V extends Variables = Variables> = Dom.RequestInit & {
    url: string;
    operationName?: string;
    variables?: V;
};
export declare type VariablesAndRequestHeaders<V extends Variables> = V extends Record<any, never> ? [variables?: V, requestHeaders?: Dom.RequestInit['headers']] : keyof RemoveIndex<V> extends never ? [variables?: V, requestHeaders?: Dom.RequestInit['headers']] : [variables: V, requestHeaders?: Dom.RequestInit['headers']];
