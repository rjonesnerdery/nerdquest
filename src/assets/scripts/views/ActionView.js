import $ from 'jquery';
import _ from 'lodash';

const SELECTORS = {
    VIEW: '.js-actionView',
    POINTS: '.js-actionView-points',
    EFFECT_LIST: '.js-actionView-effects',
    EFFECT_COUNT: '.js-actionView-effectCount',
    BADGE_LIST: '.js-actionView-badges',
    BADGE_COUNT: '.js-actionView-badgeCount',
    ITEM_LIST: '.js-actionView-items',
    ITEM_BTN: '.js-actionView-items-btn',
    ITEM_BTN_TARGET: '.js-actionView-items-btnTarget',
    ITEM_COUNT: '.js-actionView-itemCount',
};

/**
 * @fileOverview View handles updating the visual elements on the page
 */
export default class ActionView {
    /**
     * Construct the view and run initialization
     *
     * @param controller
     */
    constructor(controller) {
        this.controller = controller;

        this.effects = [];
        this.items = [];
        this.badges = [];

        this.$view = $(SELECTORS.VIEW);
        this.disabled = '';


        this.init();
    }

    /**
     * Initialize the view
     *
     * @method init
     */
    init() {
        this.isEnabled = false;

        return this.setupHandlers()
            .createChildren()
            .layout()
            .enable();
    }

    /**
     * Binds the scope of handler functions
     * Should be run once on view initialization
     *
     * @method setupHandlers
     * @returns {ActionView}
     */
    setupHandlers() {
        this.handleClick = this.onClick.bind(this);

        return this;
    }

    /**
     * Create any child objects and references to DOM elements
     * Should only be run once on init of the view
     *
     * @method createChildren
     * @returns {ActionView}
     */
    createChildren() {
        this.$points = this.$view.find(SELECTORS.POINTS);
        this.$effectList = this.$view.find(SELECTORS.EFFECT_LIST);
        this.$effectCount = this.$view.find(SELECTORS.EFFECT_COUNT);
        this.$itemList = this.$view.find(SELECTORS.ITEM_LIST);
        this.$itemCount = this.$view.find(SELECTORS.ITEM_COUNT);
        this.$badgeList = this.$view.find(SELECTORS.BADGE_LIST);
        this.$badgeCount = this.$view.find(SELECTORS.BADGE_COUNT);


        return this;
    }

    /**
     * Update the DOM to reflect the current state of the model
     *
     * @method layout
     * @returns {ActionView}
     */
    layout() {
        this.updatePoints();
        this.listEffects();
        this.listItems();
        this.listBadges();
        this.$itemBtn = this.$view.find(SELECTORS.ITEM_BTN);
        this.$itemBtnTarget = this.$view.find(SELECTORS.ITEM_BTN_TARGET);
        return this;
    }

    /**
     * Disable, update the DOM, and then re-enable to create handlers for new DOM
     *
     * @method render
     */
    render() {
        this.disable();
        this.layout();
        this.enable();
    }

    /**
     * Enables the view
     * Performs binding to handlers
     * Exits early if already enabled
     *
     * @method enable
     * @returns {ActionView}
     */
    enable() {
        if (this.isEnabled) {
            return this;
        }

        this.isEnabled = true;

        for (let i = 0; i < this.$itemBtn.length; i++) {
            this.$itemBtn[i].addEventListener('click', this.handleClick);
        }

        return this;
    }

    /**
     * Disables the view
     * Tears down any event binding to handlers
     * Exits early if it is already disabled
     *
     * @method disable
     * @returns {ActionView}
     */
    disable() {
        if (!this.isEnabled) {
            return this;
        }

        for (let i = 0; i < this.$itemBtn.length; i++) {
            this.$itemBtn[i].removeEventListener('click', this.handleClick);
        }

        this.isEnabled = false;

        return this;
    }

    /**
     * Destroys the view
     * Tears down any events, handlers, elements
     * Should be called when the object should be left unused
     *
     * @method destroy
     * @returns {ActionView}
     */
    destroy() {
        this.disable();

        return this;
    }

    /**
     * Handles click event
     *
     * @param event
     * @returns {ActionView}
     */
    onClick(event) {
        const $target = $(event.currentTarget);
        const id = $target.data('itemId');
        let itemTarget = this.$itemList.find(`.js-actionView-items-btnTarget[data-item-id=${id}]`).val();

        if (itemTarget) {
            this.controller.useItem($target.data('itemId'), itemTarget);
            itemTarget = `on ${itemTarget}`;
        } else {
            this.controller.useItem($target.data('itemId'));
        }

        console.log(`You used ${$target.data('itemName')} ${itemTarget} :: ${new Date()}`);

        this.render();

        return this;
    }

    update(effects, items, badges) {
        this.effects = effects;
        this.items = items;
        this.badges = badges;
        this.render();
    }

    updatePoints(points) {
        this.$points.text(points);
    }

    listEffects() {
        let list = '<ul>';
        let count = 0;
        if (this.effects) {
            _.forEach(this.effects, (value, key) => {
                count++;
                list += `<li class="u-color-dim">${value}</li>`;
            });
            list += `</ul>`;

            this.$effectList.html(list);
            this.$effectCount.text(count);
        }
    }

    listItems() {
        let list = '';
        let count = 0;
        if (this.items) {
            _.forEach(this.items, (value, key) => {
                count++;
                list = `<div class="vr vr_x5_inverse">
                            <ul>
                                <li><span class="rarity rarity_${value.Rarity}"></span> ${key} x${value.Id.length}</li>
                                <li class="u-small u-color-dim">${value.Description}</li>
                            </ul>
                            <input id="" type="text" name="" class="input js-actionView-items-btnTarget" data-item-id="${value.Id[0]}" style="width: 60px;" ${this.controller.disabled}>
                            <button type="button" class="js-actionView-items-btn" data-item-id="${value.Id[0]}" data-item-name="${key}" ${this.controller.disabled}>Use</button>
                        </div>
                        ${list}`;

            });
            this.$itemList.html(list);
            this.$itemCount.text(count);
        }
    }

    listBadges() {
        let list = '<ul>';
        let count = 0;
        if (this.badges) {
            _.forEach(this.badges, (value, key) => {
                count++;
                list += `<li class="u-color-dim">${value.BadgeName}</li>`;
            });
            list += `</ul>`;

            this.$badgeList.html(list);
            this.$badgeCount.text(count)
        }
    }

    setDelay() {
        this.clickTime = new Date();

    }
}
