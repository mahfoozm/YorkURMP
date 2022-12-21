import { Variables } from './types';
import * as Dom from './types.dom';
/**
 * Returns Multipart Form if body contains files
 * (https://github.com/jaydenseric/graphql-multipart-request-spec)
 * Otherwise returns JSON
 */
export default function createRequestBody(query: string | string[], variables?: Variables | Variables[], operationName?: string, jsonSerializer?: Dom.JsonSerializer): string | Dom.FormData;
