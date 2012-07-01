//
//  Copyright (c) 2011 Finnbarr P. Murphy.  All rights reserved.
//
//

const Lang = imports.lang;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

// change these to suit your own tastes and your system
const PANEL_HEIGHT = Main.panel.actor.get_height();
const AUTOHIDE_ANIMATION_TIME = 0.2;

function AutoHide() {
    this._init()
}

AutoHide.prototype = {
    _init: function() {
        this._buttonEvent = 0;
        this._leaveEvent = 0;
        this._enterEvent = 0;
        this._showEvent = 0;
        this._hideEvent = 0;

        this._hidden = false;
        this._hideable = true;
    },

    _hidePanel: function(actor, event) {
        if (Main.overview.visible || this._hideable == false) return;

        Tweener.addTween(Main.panel.actor,
                     { height: 1,
                       time: AUTOHIDE_ANIMATION_TIME,
                       transition: 'easeOutQuad'
                     });

        let params = { y: 0,
                       time: AUTOHIDE_ANIMATION_TIME,
                       transition: 'easeOutQuad'
                     };

        Tweener.addTween(Main.panel._leftCorner.actor, params);
        Tweener.addTween(Main.panel._rightCorner.actor, params);

        params = { opacity: 0,
                   time: 0,
                   transition: 'easeOutQuad'
                 };

        Tweener.addTween(Main.panel._leftBox, params);
        Tweener.addTween(Main.panel._centerBox, params);
        Tweener.addTween(Main.panel._rightBox, params);

        this._hidden = true;
    },

    _showPanel: function(actor, event) {
        if (this._hidden == false) return;

        let params = { y: PANEL_HEIGHT - 1,
                       time: AUTOHIDE_ANIMATION_TIME + 0.1,
                       transition: 'easeOutQuad'
                     };

        Tweener.addTween(Main.panel._leftCorner.actor, params);
        Tweener.addTween(Main.panel._rightCorner.actor, params);

        Tweener.addTween(Main.panel.actor,
                     { height: PANEL_HEIGHT,
                       time: AUTOHIDE_ANIMATION_TIME,
                       transition: 'easeOutQuad'
                     });

        params = { opacity: 255,
                   time: 0,
                   transition: 'easeOutQuad'
                 };

        Tweener.addTween(Main.panel._leftBox, params);
        Tweener.addTween(Main.panel._centerBox, params);
        Tweener.addTween(Main.panel._rightBox, params);

        this._hidden = false;
    },

    _toggleChrome: function(struts) {
        let mlm = Main.layoutManager;
        mlm.removeChrome(mlm.panelBox);
        mlm.addChrome(mlm.panelBox, { affectsStruts: struts });
    },

    _toggleHideable: function(actor, event) {
        if(event.get_click_count() == 2) {
            this._hideable = !this._hideable;
            this._toggleChrome(!this._hideable);
        }
    },

    enable: function() {
        this._leaveEvent = Main.panel.actor.connect('leave-event', 
                                Lang.bind(this, this._hidePanel));
        this._enterEvent = Main.panel.actor.connect('enter-event', 
                                Lang.bind(this, this._showPanel));
        this._buttonEvent = Main.panel.actor.connect('button-release-event', 
                                Lang.bind(this, this._toggleHideable));
        
        this._showEvent = Main.overview.connect('showing',
                                Lang.bind(this, this._showPanel));
        this._hideEvent = Main.overview.connect('hidden',
                                Lang.bind(this, this._hidePanel));

        this._toggleChrome(false);
        this._hideable = true;
        this._hidePanel();
    },

    disable: function() {
        if (this._buttonEvent) {
            Main.panel.actor.disconnect(this._buttonEvent);
            this._buttonEvent = 0;
        }
        if (this._leaveEvent) {
            Main.panel.actor.disconnect(this._leaveEvent);
            this._leaveEvent = 0;
        }
        if (this._enterEvent) {
            Main.panel.actor.disconnect(this._enterEvent);
            this._enterEvent = 0;
        }

        if (this._showEvent) {
            Main.overview.disconnect(this._showEvent);
            this._showEvent = 0;
        }
        if (this._hideEvent) {
            Main.overview.disconnect(this._hideEvent);
            this._hideEvent = 0;
        }

        this._toggleChrome(true);
        this._hideable = true;
        this._showPanel();
    }

};

function init() {
    return new AutoHide();
}
