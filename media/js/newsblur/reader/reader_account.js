NEWSBLUR.ReaderAccount = function(options) {
    var defaults = {
        'width': 700,
        'animate_email': false,
        'change_password': false,
        'onOpen': _.bind(function() {
            this.animate_fields();
        }, this)
    };
        
    this.options = $.extend({}, defaults, options);
    this.model   = NEWSBLUR.assets;

    this.runner();
};

NEWSBLUR.ReaderAccount.prototype = new NEWSBLUR.Modal;
NEWSBLUR.ReaderAccount.prototype.constructor = NEWSBLUR.ReaderAccount;

_.extend(NEWSBLUR.ReaderAccount.prototype, {
    
    runner: function() {
        this.options.onOpen = _.bind(function() {
            // $(window).resize();
        }, this);
        this.make_modal();
        this.open_modal();

        this.$modal.bind('click', $.rescope(this.handle_click, this));
        this.handle_change();
        this.select_preferences();
        
        if (NEWSBLUR.Globals.is_premium) {
            this.fetch_payment_history();
        }
    },
    
    make_modal: function() {
        var self = this;
        
        this.$modal = $.make('div', { className: 'NB-modal-preferences NB-modal-account NB-modal' }, [
            $.make('div', { className: 'NB-modal-tabs' }, [
                $.make('div', { className: 'NB-modal-loading' }),
                $.make('div', { className: 'NB-modal-tab NB-active NB-modal-tab-account' }, '帐户'),
                $.make('div', { className: 'NB-modal-tab NB-modal-tab-premium' }, '付款'),
                $.make('div', { className: 'NB-modal-tab NB-modal-tab-emails' }, '邮件')
            ]),
            $.make('h2', { className: 'NB-modal-title' }, [
                $.make('div', { className: 'NB-icon' }),
                '帐户设置',
                $.make('div', { className: 'NB-icon-dropdown' })
            ]),
            $.make('form', { className: 'NB-preferences-form' }, [
                $.make('div', { className: 'NB-tab NB-tab-account NB-active' }, [
                    $.make('div', { className: 'NB-preference NB-preference-username' }, [
                        $.make('div', { className: 'NB-preference-options' }, [
                            $.make('div', { className: 'NB-preference-option' }, [
                                $.make('input', { id: 'NB-preference-username', type: 'text', name: 'username', value: NEWSBLUR.Globals.username })
                            ])
                        ]),
                        $.make('div', { className: 'NB-preference-label'}, [
                            $.make('label', { 'for': 'NB-preference-username' }, '用户名'),

                            $.make('div', { className: 'NB-preference-error'})
                        ])
                    ]),
                    $.make('div', { className: 'NB-preference NB-preference-email' }, [
                        $.make('div', { className: 'NB-preference-options' }, [
                            $.make('div', { className: 'NB-preference-option' }, [
                                $.make('input', { id: 'NB-preference-email', type: 'text', name: 'email', value: NEWSBLUR.Globals.email })
                            ])
                        ]),
                        $.make('div', { className: 'NB-preference-label'}, [
                            $.make('label', { 'for': 'NB-preference-email' }, '邮件地址'),

                            $.make('div', { className: 'NB-preference-error'})
                        ])
                    ]),
                    $.make('div', { className: 'NB-preference NB-preference-password' }, [
                        $.make('div', { className: 'NB-preference-options' }, [
                            $.make('div', { className: 'NB-preference-option', style: (this.options.change_password ? 'opacity: .2' : '') }, [
                                $.make('label', { 'for': 'NB-preference-password-old' }, '旧密码'),
                                $.make('input', { id: 'NB-preference-password-old', type: 'password', name: 'old_password', value: '' })
                            ]),
                            $.make('div', { className: 'NB-preference-option' }, [
                                $.make('label', { 'for': 'NB-preference-password-new' }, '新密码'),
                                $.make('input', { id: 'NB-preference-password-new', type: 'password', name: 'new_password', value: '' })
                            ])
                        ]),
                        $.make('div', { className: 'NB-preference-label'}, [
                            '修改密码',
                            $.make('div', { className: 'NB-preference-error'})
                        ])
                    ]),
                    $.make('div', { className: 'NB-preference NB-preference-opml' }, [
                        $.make('div', { className: 'NB-preference-options' }, [
                            $.make('a', { className: 'NB-splash-link', href: NEWSBLUR.URLs['opml-export'] }, '下载 OPML')
                        ]),
                        $.make('div', { className: 'NB-preference-label'}, [
                            '备份你订阅的站点',
                            $.make('div', { className: 'NB-preference-sublabel' }, '下载此 XML 文件作为备份')
                        ])
                    ]),
                    $.make('div', { className: 'NB-preference NB-preference-delete' }, [
                        $.make('div', { className: 'NB-preference-options' }, [
                            $.make('div', { className: 'NB-splash-link NB-account-delete-all-sites' }, '删除我的全部站点')
                        ]),
                        $.make('div', { className: 'NB-preference-label'}, [
                            '删除站点',
                            $.make('div', { className: 'NB-preference-sublabel' }, '注意：您将会收到一份包含站点备份的邮件')
                        ])
                    ]),
                    $.make('div', { className: 'NB-preference NB-preference-delete' }, [
                        $.make('div', { className: 'NB-preference-options' }, [
                            $.make('a', { className: 'NB-splash-link', href: NEWSBLUR.URLs['delete-account'] }, '删除我的帐户')
                        ]),
                        $.make('div', { className: 'NB-preference-label'}, [
                            '删除我的全部信息',
                            $.make('div', { className: 'NB-preference-sublabel' }, '警告：此操作是不可恢复的')
                        ])
                    ])
                ]),
                $.make('div', { className: 'NB-tab NB-tab-premium' }, [
                    $.make('div', { className: 'NB-preference NB-preference-premium' }, [
                        $.make('div', { className: 'NB-preference-options' }, [
                            (!NEWSBLUR.Globals.is_premium && $.make('a', { className: 'NB-modal-submit-button NB-modal-submit-green NB-account-premium-modal' }, '升级至高级帐户！')),
                            (NEWSBLUR.Globals.is_premium && $.make('div', [
                                '感谢您！您拥有一个 ',
                                $.make('b', '付费帐户'),
                                '.',
                                $.make('div', { className: 'NB-block' }, '你的高级帐户将在下面的时间到期'),
                                $.make('div', { className: 'NB-block' }, [
                                    $.make('span', { className: 'NB-raquo' }, '&raquo;'),
                                    ' ',
                                    NEWSBLUR.utils.format_date(NEWSBLUR.Globals.premium_expire)
                                ]),
                                $.make('a', { href: '#', className: 'NB-block NB-account-premium-renew NB-splash-link' }, '续费和变更你的付款金额'),
                                $.make('a', { href: '#', className: 'NB-block NB-account-premium-cancel NB-splash-link' }, '取消续订')
                            ]))
                        ]),
                        $.make('div', { className: 'NB-preference-label'}, [
                            '付费'
                        ])
                    ]),
                    $.make('div', { className: 'NB-preference NB-preference-premium-history' }, [
                        $.make('div', { className: 'NB-preference-options' }, [
                            $.make('ul', { className: 'NB-account-payments' }, [
                                $.make('li', { className: 'NB-payments-loading' }, '正在载入...')
                            ])
                        ]),
                        $.make('div', { className: 'NB-preference-label'}, [
                            '付款记录'
                        ])
                    ])
                ]),
                $.make('div', { className: 'NB-tab NB-tab-emails' }, [
                    $.make('div', { className: 'NB-preference NB-preference-emails' }, [
                        $.make('div', { className: 'NB-preference-options' }, [
                            $.make('div', [
                                $.make('input', { id: 'NB-preference-emails-1', type: 'radio', name: 'send_emails', value: 'true' }),
                                $.make('label', { 'for': 'NB-preference-emails-1' }, [
                                    '当有回复、转发和新的关注者时给我发邮件'
                                ])
                            ]),
                            $.make('div', [
                                $.make('input', { id: 'NB-preference-emails-2', type: 'radio', name: 'send_emails', value: 'false' }),
                                $.make('label', { 'for': 'NB-preference-emails-2' }, [
                                    '不要给我发邮件'
                                ])
                            ])
                        ]),
                        $.make('div', { className: 'NB-preference-label'}, [
                            'Emails'
                        ])
                    ])
                ]),
                $.make('div', { className: 'NB-modal-submit' }, [
                    $.make('input', { type: 'submit', disabled: 'true', className: 'NB-modal-submit-button NB-modal-submit-green NB-disabled', value: '您可以根据需要修改上面的内容...' })
                ])
            ]).bind('submit', function(e) {
                e.preventDefault();
                self.save_account_settings();
                return false;
            })
        ]);
    },
    
    animate_fields: function() {
        if (this.options.animate_email) {
            this.switch_tab('emails');
            _.delay(_.bind(function() {
                var $emails = $('.NB-preference-emails', this.$modal);
                var bgcolor = $emails.css('backgroundColor');
                $emails.css('backgroundColor', bgcolor).animate({
                    'backgroundColor': 'orange'
                }, {
                    'queue': false,
                    'duration': 1200,
                    'easing': 'easeInQuad',
                    'complete': function() {
                        $emails.animate({
                            'backgroundColor': bgcolor
                        }, {
                            'queue': false,
                            'duration': 650,
                            'easing': 'easeOutQuad'
                        });
                    }
                });
            }, this), 200);
        } else if (this.options.change_password) {
            _.delay(_.bind(function() {
                var $emails = $('.NB-preference-password', this.$modal);
                var bgcolor = $emails.css('backgroundColor');
                $emails.css('backgroundColor', bgcolor).animate({
                    'backgroundColor': 'orange'
                }, {
                    'queue': false,
                    'duration': 1200,
                    'easing': 'easeInQuad',
                    'complete': function() {
                        $emails.animate({
                            'backgroundColor': bgcolor
                        }, {
                            'queue': false,
                            'duration': 650,
                            'easing': 'easeOutQuad'
                        });
                    }
                });
            }, this), 200);
        }

    },
    
    close_and_load_premium: function() {
      this.close(function() {
          NEWSBLUR.reader.open_feedchooser_modal();
      });
    },
    
    cancel_premium: function() {
        this.model.cancel_premium_subscription(_.bind(function(data) {
            $(".NB-preference-premium .NB-error").remove();
            $(".NB-preference-premium .NB-preference-options").append($.make("div", { className: "NB-error" }, "Your subscription will no longer automatically renew.").fadeIn(500));
        }, this), _.bind(function(data) {
            $(".NB-preference-premium .NB-error").remove();
            $(".NB-preference-premium .NB-preference-options").append($.make("div", { className: "NB-error" }, data.message || "Could not cancel your membership. Contact support.").fadeIn(500));
        }, this));
    },
    
    delete_all_sites: function() {
        var $link = $(".NB-account-delete-all-sites", this.$modal);

        if (window.confirm("确认你要删除所有内容？")) {
            NEWSBLUR.assets.delete_all_sites(_.bind(function() {
                NEWSBLUR.assets.load_feeds();
                $link.replaceWith($.make('div', '所有的内容都已删除。'));
            }, this), _.bind(function() {
                $link.replaceWith($.make('div', { className: 'NB-error' }, '删除你的站点时遇到一点问题，请刷新或稍候再试。'));
            }, this));
        }
    },
    
    handle_cancel: function() {
        var $cancel = $('.NB-modal-cancel', this.$modal);
        
        $cancel.click(function(e) {
            e.preventDefault();
            $.modal.close();
        });
    },
    
    select_preferences: function() {
        var pref = this.model.preference;
        $('input[name=send_emails]', this.$modal).each(function() {
            if ($(this).val() == ""+pref('send_emails')) {
                $(this).attr('checked', true);
                return false;
            }
        });
    },
        
    serialize_preferences: function() {
        var preferences = {};

        $('input[type=radio]:checked, select, input[type=text], input[type=password]', this.$modal).each(function() {
            var name       = $(this).attr('name');
            var preference = preferences[name] = $(this).val();
            if (preference == 'true')       preferences[name] = true;
            else if (preference == 'false') preferences[name] = false;
        });
        $('input[type=checkbox]', this.$modal).each(function() {
            preferences[$(this).attr('name')] = $(this).is(':checked');
        });

        return preferences;
    },
    
    save_account_settings: function() {
        var self = this;
        var form = this.serialize_preferences();
        $('.NB-preference-error', this.$modal).text('');
        $('input[type=submit]', this.$modal).val('正在保存...').attr('disabled', true).addClass('NB-disabled');
        
        NEWSBLUR.log(["form['send_emails']", form['send_emails']]);
        this.model.preference('send_emails', form['send_emails']);
        this.model.save_account_settings(form, function(data) {
            if (data.code == -1) {
                $('.NB-preference-username .NB-preference-error', this.$modal).text(data.message);
                return self.disable_save();
            } else if (data.code == -2) {
                $('.NB-preference-email .NB-preference-error', this.$modal).text(data.message);
                return self.disable_save();
            } else if (data.code == -3) {
                $('.NB-preference-password .NB-preference-error', this.$modal).text(data.message);
                return self.disable_save();
            }
            
            NEWSBLUR.Globals.username = data.payload.username;
            NEWSBLUR.Globals.email = data.payload.email;
            $('.NB-module-account-username').text(NEWSBLUR.Globals.username);
            $('.NB-feeds-header-user-name').text(NEWSBLUR.Globals.username);
            self.close();
        });
    },
    
    fetch_payment_history: function() {
        this.model.fetch_payment_history(NEWSBLUR.Globals.user_id, _.bind(function(data) {
            var $history = $('.NB-account-payments', this.$modal).empty();
            _.each(data.payments, function(payment) {
                $history.append($.make('li', { className: 'NB-account-payment' }, [
                    $.make('div', { className: 'NB-account-payment-date' }, payment.payment_date),
                    $.make('div', { className: 'NB-account-payment-amount' }, "$" + payment.payment_amount),
                    $.make('div', { className: 'NB-account-payment-provider' }, payment.payment_provider)
                ]));
            });
            $(window).resize();
        }, this));
    },
    
    // ===========
    // = Actions =
    // ===========

    handle_click: function(elem, e) {
        var self = this;
        
        $.targetIs(e, { tagSelector: '.NB-modal-tab' }, function($t, $p) {
            e.preventDefault();
            var newtab;
            if ($t.hasClass('NB-modal-tab-account')) {
                newtab = 'account';
            } else if ($t.hasClass('NB-modal-tab-premium')) {
                newtab = 'premium';
            } else if ($t.hasClass('NB-modal-tab-emails')) {
                newtab = 'emails';
            }
            self.switch_tab(newtab);
        });        
        $.targetIs(e, { tagSelector: '.NB-account-premium-modal' }, function($t, $p) {
            e.preventDefault();
            
            self.close_and_load_premium();
        });        
        $.targetIs(e, { tagSelector: '.NB-account-premium-renew' }, function($t, $p) {
            e.preventDefault();
            
            self.close_and_load_premium();
        });        
        $.targetIs(e, { tagSelector: '.NB-account-premium-cancel' }, function($t, $p) {
            e.preventDefault();
            
            self.cancel_premium();
        });           
        $.targetIs(e, { tagSelector: '.NB-account-delete-all-sites' }, function($t, $p) {
            e.preventDefault();
            
            self.delete_all_sites();
        });        
        $.targetIs(e, { tagSelector: '.NB-modal-cancel' }, function($t, $p) {
            e.preventDefault();
            
            self.close();
        });
    },
    
    handle_change: function() {
        $('input[type=radio],input[type=checkbox],select,input', this.$modal).bind('change', _.bind(this.enable_save, this));
        $('input', this.$modal).bind('keydown', _.bind(this.enable_save, this));
    },
    
    enable_save: function() {
        $('input[type=submit]', this.$modal).removeAttr('disabled').removeClass('NB-disabled').val('保存我的帐户');
    },
    
    disable_save: function() {
        this.resize();
        $('input[type=submit]', this.$modal).attr('disabled', true).addClass('NB-disabled').val('您可以根据需要修改上面的内容...');
    }
    
});
