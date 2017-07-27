import $ from 'jquery';
import _ from 'lodash';
import 'jquery.cookie';
import { CONFIG } from '../config';

/**
 * ItemsModel
 *
 * @class ItemsModel
 * @constructor
 */
export default class ItemsModel {
    constructor(controller) {
        this.controller = controller;
        this.response = '';
        this.effects = [];
        this.items = {};
        this.badges = {};

        this.init();
    }

    init() {
        this.updateItems();
        console.log(this.items);

        return this;
    }

    async postData(url) {
        $.ajax({
            url: url,
            type:"POST",
            crossDomain: true,
            headers: {
                'apikey': CONFIG.API_KEY,
                'access-control-allow-origin': CONFIG.URL_BASE,
                'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'access-control-allow-headers': 'content-type, accept',
                'access-control-max-age': 10, // Seconds
            },
            error: () => {
                console.log('error');
                return false;
            },
            success: (response) => {
                this.handleResponse(response);
            }
        });
    }

    handleResponse(response) {
        console.log(response);
        if (response.Item) {
            this.addItem(response.Item);
        }
        if (JSON.stringify(response.Effects) !== JSON.stringify(this.response.Effects)
            || JSON.stringify(response.Badges) !== JSON.stringify(this.response.Badges) ) {
            this.effects = response.Effects;
            this.badges = response.Badges;
            this.controller.updateView();
        }
        if (response.Points !== this.response.Points) {
            this.controller.updatePoints(response.Points);
        }
        this.response = response;
        return this;
    }

    addItem(item) {
        const date = Date.now();
        const newItem = {
            [item.Id]: {
                'Name': item.Name,
                'Rarity': item.Rarity,
                'Description': item.Description,
            }
        };
        this.updateItems();
        _.assign(this.items, newItem);
        this.setItemsInCookie(this.items);
        console.log(`Item Added: ${item.Name}`);
        this.controller.updateView();
        return this;
    }

    removeItem(id) {
        this.items = _.pickBy(this.items, (value, key) => {
            return key !== id;
        });
        this.setItemsInCookie(this.items);
        this.controller.updateView();
        return this;
    }

    clearItems() {
        this.items = [];
        $.removeCookie(CONFIG.COOKIE);
        this.controller.updateView();
        return this;
    }

    updateItems() {
        this.items = this.getItemsFromCookie();
        return this;
    }

    getItemsFromCookie() {
        if ($.cookie(CONFIG.COOKIE)) {
            return JSON.parse($.cookie(CONFIG.COOKIE))
        } else {
            return {};
        }
    }

    setItemsInCookie(data) {
        $.cookie(CONFIG.COOKIE, JSON.stringify(data));
        return this;
    }

    count() {
        this.updateItems();
        let i = 0;
        _.forEach(this.items, () => {
            i++;
        });
        return i;
    }
}
