import $ from 'jquery';
import _ from 'lodash';
import moment from 'moment';
import { CONFIG } from '../config';
import { ITEM_TYPE } from '../data/ItemType';

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
    AUTO_BTN: '.js-actionView-auto',
    AUTO_TARGET: '.js-actionView-baseTarget',
    CONSOLE: '.js-actionView-console',
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
        this.handleAutoBtnClick = this.onAutoBtnClick.bind(this);
        this.handleAutoTargetInput = this.onAutoTargetInput.bind(this);

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
        this.$autoBtn = this.$view.find(SELECTORS.AUTO_BTN);
        this.$autoTargetInput = this.$view.find(SELECTORS.AUTO_TARGET);
        this.$console = this.$view.find(SELECTORS.CONSOLE);

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
        return this;
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

        for (let i = 0; i < this.$autoBtn.length; i++) {
            this.$autoBtn[i].addEventListener('click', this.handleAutoBtnClick);
            if (this.controller.auto[$(this.$autoBtn[i]).data('autoType')]) { $(this.$autoBtn[i]).addClass('active'); };
        }

        for (let i = 0; i < this.$autoTargetInput.length; i++) {
            this.$autoTargetInput[i].addEventListener('input', this.handleAutoTargetInput);
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

        for (let i = 0; i < this.$autoBtn.length; i++) {
            this.$autoBtn[i].removeEventListener('click', this.handleAutoBtnClick);
        }

        for (let i = 0; i < this.$autoTargetInput.length; i++) {
            this.$autoTargetInput[i].removeEventListener('input', this.handleAutoTargetInput);
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

        this.render();

        return this;
    }

    update(effects, items, badges) {
        this.effects = effects;
        this.items = items;
        this.badges = badges;
        this.render();
        return this;
    }

    updatePoints(points) {
        this.$points.text(points);
        this.controller.updateTitle(points);
        return this;
    }

    listEffects() {
        let list = '<ul>';
        let count = 0;
        let urlName = '';
        if (this.effects) {
            _.forEach(this.effects, (value, key) => {
                urlName = this.getUrlName(value);
                count++;
                list += `<li class="u-color-dim">
                            <img src="${CONFIG.URL}${CONFIG.IMG_PATH}/${urlName}.svg" class="imgSvg" alt="${value}" />
                            <!--${value}-->
                        </li>`;
            });
            list += `</ul>`;

            this.$effectList.html(list);
            this.$effectCount.text(count);
        }
        return this;
    }

    listItems() {
        let list = '';
        this.count = 0;
        _.forEach(ITEM_TYPE, (value, key) => {
            const itemsOfType = _.pick(this.items, value);
            this.items = _.omit(this.items, value);
            if (itemsOfType) { list += this.getList(itemsOfType, key); }
        });
        if (this.items) { list += this.getList(this.items, 'UNCATEGORIZED'); }
        this.$itemList.html(list);
        this.$itemCount.text(this.count);
        return this;
    }

    getList(items, title) {
        let list = '';
        let urlName = '';
        list += `<div class="vr vr_x8">
                    <h3 class="hdg hdg_3 u-center" style="padding-bottom: 20px;">-${title}-</h3>
                    <div class="blocks blocks_1up blocks_2upXS blocks_3upS blocks_5upM mix-blocks_space">`;
        _.forEach(items, (value, key) => {
            this.count++;
            urlName = this.getUrlName(key);
            //<img src="${CONFIG.URL}${CONFIG.IMG_PATH}/${urlName}.svg" />
            list += `    <div class="vr vr_x2_inverse">
                            <span style="width: 60px !important; display: inline-block; position: relative">
                                <button type="button" class="toggleBtn mix-toggleBtn_fill mix-toggleBtn_overlay js-actionView-items-btn" data-item-id="${value.Id[0]}" data-item-name="${key}" ${this.controller.disabled}>
                                    <img src="${CONFIG.URL}${CONFIG.IMG_PATH}/${urlName}.svg" />
                                </button>
                                <input id="" type="text" name="" class="input mix-input_fill js-actionView-items-btnTarget" data-item-id="${value.Id[0]}" ${this.controller.disabled} placeholder="Target">
                               
                            </span>
                           <span style="width: calc(100% - 70px); vertical-align: top; display: inline-block;">
                                <div><span class="rarity rarity_${value.Rarity}"></span> ${key} x${value.Id.length}</div>
                                <div class="u-small u-color-dim">${value.Description}</div>
                            </span>
                            
                            <!--<li class="u-small u-color-dim">${value.Description}</li>
                            <span class="rarity rarity_${value.Rarity}"></span> ${key} x${value.Id.length}-->
                        </div>`;
        });
        list += `</div></div>`;
        return list;
    }

    listBadges() {
        let list = '<ul>';
        let count = 0;
        let urlName = '';
        if (this.badges) {
            _.forEach(this.badges, (value, key) => {
                urlName = this.getUrlName(value.BadgeName);
                count++;
                list += `<li class="u-color-dim">
                            <img src="${CONFIG.URL}${CONFIG.IMG_PATH}/${urlName}.svg" class="imgSvg" alt="${value.BadgeName}" />
                            <!--${value.BadgeName}-->
                        </li>`;
            });
            list += `</ul>`;

            this.$badgeList.html(list);
            this.$badgeCount.text(count)
        }
        return this;
    }

    setDelay() {
        this.clickTime = new Date();
        return this;
    }

    onAutoBtnClick(event) {
        const $target = $(event.currentTarget);
        const type = $target.data('autoType');

        this.controller.auto[type] = !this.controller.auto[type];
        $target.toggleClass('active');

        return this;
    }

    onAutoTargetInput() {
        const $target = $(event.currentTarget);
        const $attackBtn = this.$view.find(`${SELECTORS.AUTO_BTN}[data-auto-type="attack"]`);
        $attackBtn.prop('disabled', !$target.val());
        this.controller.baseTarget = $target.val();

        if (!$target.val() && this.controller.auto.attack) {
            this.controller.auto.attack = false;
            $attackBtn.toggleClass('active');
        }

        return this;
    }

    logToConsole(message) {
        this.$console.html(`<div><span class="u-tiny u-color-dim">${moment().format('YYYY/MM/DD h:mm:ss a')}:</span> ${message}</div>${this.$console.html()}`)
        return this;
    }

    getUrlName(name) {
        let urlName = name.replace(/[']/g, '');
        urlName = urlName.replace(/[“”‘’]/g,'');
        urlName = urlName.replace(/[\u2018\u2019]/g, '');
        urlName = urlName.replace(/[\u201C\u201D]/g, '');
        urlName = urlName.replace(/:/g, '');
        return urlName.replace(/ /g, '-').toLowerCase();
    }
}
