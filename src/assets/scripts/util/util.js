import $ from 'jquery';
import { CONFIG } from '../config';

/**
 * @method delay
 * @param {String} ms milliseconds to delay
 * @return {Promise}
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(_ => resolve(), ms));
}