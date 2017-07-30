import $ from 'jquery';
import _ from 'lodash';
import 'jquery.cookie';
import { CONFIG, FIREBASE_CONFIG, FIREBASE_CONFIG_V2 } from '../config';
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

        firebase.initializeApp(FIREBASE_CONFIG_V2);
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
            console.log(`Error: ${response}`);
            if (id) { this.removeItem(id); }
            this.controller.postURL = this.controller.defaultPostURL;
            this.controller.itemId = '';
            this.controller.postLoop();
        });

        return deferred;
    }

    handleResponse(response, id) {
        console.log(response);
        if (response.Item) {
            this.addItem(response.Item);
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
        this.response = response;
        return this;
    }

    addItem(item) {
        console.log(item);
        console.log(item.Name);
        console.log(this.items[item.Name]);
        console.log('-------');
        if (this.items[item.Name]) {
            this.items[item.Name].Id.push(item.Id);
            //this._firebase.ref().child(item.Name).update(this.items[item.Name].Id);
        } else {
            this.items[item.Name] = {
                Id: [item.Id],
                Description: item.Description,
                Rarity: item.Rarity,
            };
        }
        this._firebase.ref().child(item.Name).update(this.items[item.Name]);
        console.log(`Item Added: ${item.Name}`);
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
                this._firebase.ref().child(key).update(this.items[key]);
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
            this.controller.updateView();
            return this;
        }, (error) => {
            console.log("Firebase Get Error: " + error.code);
        });
    }

    count() {
        let i = 0;
        _.forEach(this.items, () => {
            i++;
        });
        return i;
    }
}
