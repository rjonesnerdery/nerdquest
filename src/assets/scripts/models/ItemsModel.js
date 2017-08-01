import $ from 'jquery';
import _ from 'lodash';
import 'jquery.cookie';
import { CONFIG, FIREBASE_CONFIG } from '../config';
import { ITEM_TYPE } from '../data/ItemType';
import firebase from 'firebase';

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

        firebase.initializeApp(FIREBASE_CONFIG);
        this._firebase = firebase.database();

        this.init();
    }

    init() {
        this.loadData();

        return this;
    }

    async postData(url, id) {
        const deferred = $.Deferred();
        $.ajax({
            url: url,
            type: "POST",
            crossDomain: true,
            headers: {
                'apikey': CONFIG.API_KEY,
                'access-control-allow-origin': CONFIG.URL_BASE,
                'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'access-control-allow-headers': 'content-type, accept',
                'access-control-max-age': 10, // Seconds
            }
        }).done((response) => {
            this.handleResponse(response, id);
            deferred.resolve(response);
        }).fail((response) => {
            this.controller.logMessage(`Error: ${response}`);
            if (id) { this.removeItem(id); }
            this.controller.postURL = this.controller.defaultPostURL;
            this.controller.itemId = '';
            this.controller.postLoop();
        });

        return deferred;
    }

    handleResponse(response, id) {
        _.forEach(response.Messages, (o) => {
            this.controller.logMessage(o);
        });
        if (response.Item) {
            this.addItem(response.Item);
            console.log(response.Item);
        }
        if (response.TargetName) {
            this.removeItem(id);
            this.controller.disabled = 'disabled';
            if (!this.controller.isLoop) { this.controller.updateView(); }
            this.controller.clickTimeout();
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
        if (id) {
            this.controller.postURL = this.controller.defaultPostURL;
            this.controller.itemId = '';
        }
        if (response.Messages && !this.controller.userName) {
            const location = response.Messages[0].indexOf(' ');
            this.controller.userName = response.Messages[0].substr(0, location);
            this.controller.updateUser();
        }
        this.response = response;
        return this;
    }

    addItem(item) {
        if (this.items[item.Name]) {
            this.items[item.Name].Id.push(item.Id);
        } else {
            this.items[item.Name] = {
                Id: [item.Id],
                Description: item.Description,
                Rarity: item.Rarity,
            };
        }
        this._firebase.ref().child(item.Name).update(this.items[item.Name]);
        this.controller.updateView();
        return this;
    }

    removeItem(id) {
        _.forEach(this.items, (value, key) => {
            const location = _.findIndex(this.items[key].Id, (o) => {
                return o === id;
            });
            if (location > -1) {
                this.items[key].Id.splice(location, 1);
                if (this.items[key].Id.length) {
                    this._firebase.ref().child(key).update(this.items[key]);
                } else {
                    delete this.items[key];
                    this._firebase.ref().child(key).set(null);
                }

            }
        });
        this.controller.updateView();
        return this;
    }

    clearItems() {
        return this;
    }

    loadData() {
        const ref = this._firebase.ref();
        ref.once("value", (snapshot) => {
            this.items = snapshot.val();
            this.controller.createView();
            return this;
        }, (error) => {
            this.controller.logMessage("Firebase Get Error: " + error.code);
        });
    }

    count() {
        let i = 0;
        _.forEach(this.items, () => {
            i++;
        });
        return i;
    }

    pickItem() {
        let target= '';
        let itemSubset = {};
        let attacks = {};
        let buffs = {};
        if (this.controller.auto.protect && _.intersection(ITEM_TYPE.PROTECTION, this.effects).length === 0) {
            itemSubset = _.pick(this.items, ITEM_TYPE.PROTECTION);
        } else if (this.controller.auto.buff && _.intersection(ITEM_TYPE.GAINERS, this.effects).length === 0) {
            itemSubset = _.pick(this.items, ITEM_TYPE.GAINERS);
        } else {
            buffs = this.controller.auto.buff ? _.pick(this.items, ITEM_TYPE.BUFFS) : {};
            attacks = this.controller.auto.attack ? _.pick(this.items, ITEM_TYPE.ATTACKS) : {};
            _.assign(itemSubset, buffs, attacks);
        }
        if (Object.keys(itemSubset).length) {
            const rand = Math.floor(Math.random() * (Object.keys(itemSubset).length));
            const chosenItemName = Object.keys(itemSubset)[rand];
            const chosenItem = itemSubset[chosenItemName];
            if (_.includes(Object.keys(attacks), chosenItemName) && this.controller.baseTarget) {
                target = this.controller.baseTarget;
            }
            this.controller.useItem(chosenItem.Id[0], target);
        }
        return this;
    }
}
