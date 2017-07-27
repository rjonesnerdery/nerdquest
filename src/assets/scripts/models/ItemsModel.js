import $ from 'jquery';
import _ from 'lodash';
import 'jquery.cookie';
import { CONFIG,FIREBASE_CONFIG  } from '../config';
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
                this.handleResponse(response, id);
            }
        });
    }

    handleResponse(response, id) {
        console.log(response);
        if (response.Item) {
            this.addItem(response.Item);
        }
        if (response.TargetName) {
            this.removeItem(id);
            this.controller.disabled = 'disabled';
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
        this.response = response;
        return this;
    }

    addItem(item) {
        const newItem = {
            [item.Id]: {
                'Name': item.Name,
                'Rarity': item.Rarity,
                'Description': item.Description,
            }
        };
        if (this.items) {
            _.assign(this.items, newItem);
            firebase.database().ref().set(this.items);
            console.log(`Item Added: ${item.Name}`);
        }
        this.controller.updateView();
        return this;
    }

    removeItem(id) {
        this.items = _.pickBy(this.items, (value, key) => {
            return key !== id;
        });
        if (this.items) {
            firebase.database().ref().set(this.items);
        }
        this.controller.updateView();
        return this;
    }

    clearItems() {
        this.items = [];
        $.removeCookie(CONFIG.COOKIE);
        this.controller.updateView();
        return this;
    }

    loadData() {
        const ref = firebase.database().ref();
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
