// Initialize your app
var myApp = new Framework7({
});

// Export selectors engine
var $$ = Framework7.$;
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

function check_empty(formData){
    for(key in formData) {
        if (formData[key].length === 0) {
            return false;
        }
    }
    return true;
}

/** ----- 用户引导 ------**/
//var isFirst = localStorage.getItem('isFirst'),
var my_first = {},
    av_image = null,
    av_story_image = null,
    av_current_user = null,
    av_card_user = null;
/*
if (!isFirst) {
    // user guide
    myApp.popup('.popup-login-first');
    // bind image upload
    uploadImg($('#upload-avatar'), $('#my-avatar-preview'));
    $('.link-login-next').on('click', function(e) {
        var formData = myApp.formToJSON('#login-first-form');
        if (!check_empty(formData)) {
            myApp.alert('请填写完整信息', '新用户注册'); 
            return false;
        } else {
            my_first = $.extend(my_first, formData);
            Me2er.add(my_first['my-name'], my_first['my-gender'], my_first['my-age'], av_image, 
                function(user){
                    console.log('add new User: ' + user.get('name') + ' success...');
                    av_current_user = user;
                    localStorage.setItem('current_user', JSON.stringify(av_current_user));
                }, function(user, error){
                    console.log('add me2er failed.');
                    console.log(error);
                }
            );
        }
    });
    $('.finish-login').on('click', function(e) {
        var formData = myApp.formToJSON('#login-last-form');
        if (formData['my-interest'] && formData['my-interest'].length){
            $.each(formData['my-interest'], function(index, point_name){
                var point = Point.add(point_name, function(point){
                    Face.add(av_current_user, point, function(face){
                        console.log('saving inistial faces success');
                        localStorage.setItem('isFirst', 'no');
                    });
                });
            })         
        } else {
            localStorage.setItem('isFirst', 'no');
        }
        g_change_user();
    });
    function generateInitHotList(points, $ul){
        var tmpl = '';
        $.each(points, function(index, point){
            tmpl += '<li>'
                  + '    <label class="label-checkbox item-content">'
                  + '       <input type="checkbox" name="my-interest" value="' + point.get('name') + '">'
                  + '       <div class="item-media">'
                  + '            <i class="icon icon-form-checkbox"></i>'
                  + '        </div>'
                  + '          <div class="item-inner">'
                  + '              <div class="item-title">' + point.get('name') + '</div>'
                  + '         </div>'
                  + '     </label>'
                  + ' </li>';
        });
        $ul.html(tmpl);
    }
    Point.get_hots(function(points){
        generateInitHotList(points, $('#init-hot-point-list'));
    });
}
*/
var mySlider = null;
/** -------- 换人 ------ **/
$('.page').on('click', '.refresh', function(e) {
    console.log('clcik people');
    var $btn = $(e.target),
        $card = $btn.parents('.card'),
        $next_card = $card.clone(true);
    $card.addClass('removed');
    $next_card.find('.slider-slide').remove();
    // todo : ajax request ; copy dom -> rewrite
    //mySlider.distroy();
    setTimeout(function() {
        $card.remove();
        $next_card.appendTo($('.card-wrap'));
        g_change_user();
    }, 800);
});

function g_change_user(){
    av_current_user.change_user(function(new_me2er, tip){
        av_card_user = new_me2er;
        console.log('change new user');
        fillupCardUser(new_me2er);        
        showUnlockTip(tip, 1000);
    });
}

function generateCardSlide(me2er){
    console.log('-----生成card-----');
    av_current_user.get_faces_by_other(me2er, function(faces, pos){
        console.log('faces count is : ' + faces.length);
        $('.slider-wrapper').empty();
        $.each(faces, function(index, face){
            var point = face.get('point'),
                point_name = point.get('name'),
                other_name = me2er.get('name');
            Story.gets_by_face(face, function(storys){
                av_current_user.can_see(face, function(res){
                    (function(){
                    if (storys.length){
                        var story = storys[0],
                            story_image = get_image_url(story, 2),
                            story_text = story.get('text'),
                            story_id = story.id;
                    } else {
                        var story_image = '/img/large_default_bg.png',
                            story_text = '【尚未添加故事】';
                    }
                    if(!res){
                        var tmpl = '<div class="slider-slide">' + 
                                   '    <img class="story-img" src="' + story_image + '" alt="">' +
                                   '    <img class="lock-mask" src="/img/locked_bg.jpg">' +
                                   '    <div class="story-panel">' +
                                   '        <div class="row story-hd">' +
                                   '            <div class="left-title">' +
                                   '                <span class="point">' + point_name + '</span>' +
                                   '            </div>' +
                                   '            <div class="right-act">' + 
                                   '                <a class="icon-btn chat-btn" style="display:none;" href="chat.html?other_name=' + other_name + '&point_name=' + point_name + '&story_id=' + story_id + '&story_text=' + story_text + '&story_image=' + story_image + '"><i class="icon iconfont icon-message"></i>回应</a>' +
                                   '                <a class="icon-btn unlock-btn" data-faceid="' + face.id + '"><i class="icon iconfont icon-lock"></i>解锁</a>' +
                                   '            </div>' +
                                   '        </div>' +
                                   '        <div class="story-bd" style="display:none;">' + story_text + '</div>' +
                                   '    </div>' +
                                   '</div>';
                    } else {
                        var tmpl = '<div class="slider-slide">' + 
                                   '    <img class="story-img" src="' + story_image + '" alt="">' +
                                   '    <div class="story-panel">' +
                                   '        <div class="row story-hd">' +
                                   '            <div class="left-title">' +
                                   '                <span class="point">' + point_name + '</span>' +
                                   '            </div>' +
                                   '            <div class="right-act">' + 
                                   '                <a class="icon-btn chat-btn" href="chat.html?other_name=' + other_name + '&point_name=' + point_name + '&story_id=' + story_id + '&story_text=' + story_text + '&story_image=' + story_image + '"><i class="icon iconfont icon-message"></i>回应</a>' +
                                   '            </div>' +
                                   '        </div>' +
                                   '        <div class="story-bd">' + story_text + '</div>' +
                                   '    </div>' +
                                   '</div>';  
                    }
                        
                    $('.slider-wrapper').append(tmpl);
                    mySlider = myApp.slider('.slider-container', {
                        spaceBetween: 10
                    }); 
                    })();
                });

            });
        });
        $('.card').show();
    });
}
$('body').on('click', '.unlock-btn', function(e){
    console.log('点击解锁');
    var $slide = $(e.target).parents('.slider-slide'),
        $lock_mask = $slide.find('.lock-mask'),
        $chat_btn = $slide.find('.chat-btn'),
        $unlock_btn = $slide.find('.unlock-btn'),
        $story_text = $slide.find('.story-bd'),
        face_id = $(e.target).data('faceid');
    $lock_mask.addClass('disappear');
    Face.get_by_id(face_id, function(face){
        Face.unlock(av_current_user, face, function(face, tip){
            showUnlockTip(tip, 1000);
            $lock_mask.remove();
            $unlock_btn.remove();
            $chat_btn.show();
            $story_text.show();
        });
    });
});

function showUnlockTip(tip, time){
    myApp.modal({text: tip});
    setTimeout(function(){
        myApp.closeModal();
    }, time);
}

function fillupCardUser(me2er){
    var name = me2er.get('name'),
        sex = me2er.get('sex'),
        age = me2er.get('age'),
        image = me2er.get('image'),
        image_url = get_image_url(me2er, 1);

    var $card = $('.card'),
        sex_icon = '';
    if (sex === '男'){
        sex_icon = '<i class="icon iconfont icon-Male" style="color:#3879d9;"></i>';
    } else {
        sex_icon = '<i class="icon iconfont" style="color:#f9379a;">&#xe600;</i>';
    }
    $card.find('.user-name').text(name),
    $card.find('.user-info').html('<span>' + sex_icon + '</span><span>' + age + '</span><span>' + '北京' + '</span>');
    $card.find('.user-avatar').attr('src', image_url);

    av_current_user.count_same_faces(me2er, function(num){
        $card.find('.same-face-count').text(num);
    });
    av_current_user.count_diff_faces(me2er, function(num){
        $card.find('.diff-face-count').text(num);
    });
    generateCardSlide(me2er);

}

/* get hosts point */
function generateInitHotList(points, $ul){
    var tmpl = '';
    $.each(points, function(index, point){
        tmpl += '<li>'
              + '    <label class="label-checkbox item-content">'
              + '       <input type="checkbox" name="my-interest" value="' + point.get('name') + '">'
              + '       <div class="item-media">'
              + '            <i class="icon icon-form-checkbox"></i>'
              + '        </div>'
              + '          <div class="item-inner">'
              + '              <div class="item-title">' + point.get('name') + '</div>'
              + '         </div>'
              + '     </label>'
              + ' </li>';
    });
    $ul.html(tmpl);
}

myApp.showPreloader();
Me2er.get_current(function(me2er){
    av_current_user = me2er;
    myApp.hidePreloader();
    if (!me2er){
        myApp.popup('.popup-login-first');
        // bind image upload
        uploadImg($('#upload-avatar'), $('#my-avatar-preview'));
        $('.link-login-next').on('click', function(e) {
            var formData = myApp.formToJSON('#login-first-form');
            if (!check_empty(formData)) {
                myApp.alert('请填写完整信息', '新用户注册'); 
                return false;
            } else {
                my_first = $.extend(my_first, formData);
                Me2er.add(my_first['my-name'], my_first['my-gender'], my_first['my-age'], av_image, 
                    function(user){
                        console.log('add new User: ' + user.get('name') + ' success...');
                        av_current_user = user;
                        localStorage.setItem('current_user', JSON.stringify(av_current_user));
                    }, function(user, error){
                        console.log('add me2er failed.');
                        console.log(error);
                    }
                );
            }
        });
        $('.finish-login').on('click', function(e) {
            var formData = myApp.formToJSON('#login-last-form');
            if (formData['my-interest'] && formData['my-interest'].length){
                $.each(formData['my-interest'], function(index, point_name){
                    var point = Point.add(point_name, function(point){
                        Face.add(av_current_user, point, function(face){
                            console.log('saving inistial faces success');
                            localStorage.setItem('isFirst', 'no');
                        });
                    });
                })         
            } else {
                localStorage.setItem('isFirst', 'no');
            }
            g_change_user();
        });
        Point.get_hots(function(points){
            generateInitHotList(points, $('#init-hot-point-list'));
        });
    } else {
        // get first card
        me2er.change_user(function(new_me2er){
            av_card_user = new_me2er;
            console.log('get new user , name : ' + new_me2er.get('name'));
            fillupCardUser(new_me2er);        
        });
    }
});

// add new face  
$('.add-point-btn').on('click', function(e) {
    var $btn = $(e.target),
        $inp = $('.point-inp'),
        $close_btn = $('.add-point-panel .close-popup'),
        point_name = $.trim($inp.val());

    if (point_name.length > 0) {
        Point.add(point_name, function(point){
            Face.add(av_current_user, point, function(face){
                console.log('is first ' + face.get('first_add') );
                if (face.get('first_add')) {
                    addFaceItem(face.id, point_name);
                }
            });
        });
    }
});  

$('.hot-point-list').on('click', 'li', function(e) {
    var value_point = $.trim($(e.target).text()),
        $inp = $('.point-inp');
    $inp.val(value_point);
});

$('.add-point-panel').on('click', '.close-popup', function(e){
    var $popup = $(this).parents('.add-point-panel'),
        $inp = $popup.find('.point-inp');
    $inp.val('');
});

function addFaceItem(face_id, point_name, story_image, story_text) {
    var story_image = story_image || '/img/default_story.png',
        story_text = story_text || '【暂无故事】';
    var tmpl = '<li>' +
        '<a href="edit_story.html?point_name=' + point_name + '" class="item-link">' +
        '   <div class="item-content">' +
        '       <div class="item-media">' +
        '           <img src="' + story_image + '" width="60" height="60" alt="">' +
        '       </div>' +
        '       <div class="item-inner">' +
        '           <div class="item-title-row">' +
        '               <div class="item-title">' + point_name + '</div>' +
        '               <div class="item-after"><i class="icon iconfont icon-edit"></i></div>' +
        '           </div>' +
        '           <div class="item-text">' + story_text + '</div>' +
        '       </div>' +
        '   </div>' +
        '</a>' +
        '</li>',
        $new_li_item = $(tmpl);
    $('.point-list').prepend($new_li_item);
}

function uploadImg(inp, preview) {
    inp.on('change', function(e) {
        var f_reader = new FileReader(),
            file = inp[0].files[0];
        f_reader.readAsDataURL(file);
        f_reader.onload = function(event) {
            preview.attr('src', event.target.result);
            Image.add(file, function(f){
                av_image = f;
            });
        }
    });
}

myApp.onPageBeforeInit('index', function(page){
    fillupCardUser(av_card_user);
    $('.page').on('click', '.refresh', function(e) {
        console.log('clcik people');
        var $btn = $(e.target),
            $card = $btn.parents('.card'),
            $next_card = $card.clone(true);
        $card.addClass('removed');
        setTimeout(function() {
            $card.remove();
            $next_card.appendTo($('.card-wrap'));
            av_current_user.change_user(function(new_me2er, tip){
                av_card_user = new_me2er;
                console.log('change new user');
                fillupCardUser(new_me2er);        
                showUnlockTip(tip, 1000);
            });
        }, 800);
    });
});

myApp.onPageBeforeInit('edit_story', function(page) {
    var query = page.query,
        point_name = query['point_name'],
        point = null,
        cur_face = null; 
    av_image = null;

    $('.story-hd.center').text(point_name);
    
    Me2er.get_current(function(me2er){
        Point.add(point_name, function(point){
            Face.get_by_user_point(me2er, point, function(face){
                Story.gets_by_face(face, function(storys){
                    // fillup template
                    var story = storys[0],
                        story_image = story ? get_image_url(story, 2) : '/img/default_story.png',
                        story_text = story ? story.get('text') : '';
                    $('#story-pic-preview').attr('src', story_image);
                    $('textarea[name="story_text"]').text(story_text); 
                });

                // 绑定事件，保存
                $('.save-story-btn').on('click', function(e) {
                    var formData = myApp.formToJSON('#edit-story-form'),
                        story_text = $.trim(formData['story_text']);
                    myApp.showPreloader('saving...');
                    Story.add(face, av_image, story_text, function(story){
                        console.log('save story success');
                        myApp.hidePreloader();
                        mainView.loadPage('profile.html', false);
                        //mainView.goBack('profile.html');
                    });
                });
            });
        });
    });

    uploadImg($('#story-pic'), $('#story-pic-preview'));
});

myApp.onPageBeforeInit('profile', function(page) {
    console.log('aaaa');
    Me2er.get_current(function(me2er){
        //var me2er = me2er[0],
        var my_name = me2er.get('name'),
            my_age = me2er.get('age'),
            sex = me2er.get('sex'),
            sex_icon = '',
            avatar_src = get_image_url(me2er, 1);

        if (sex === '男'){
            sex_icon = '<i class="icon iconfont icon-Male" style="color:#3879d9;"></i>';
        } else {
            sex_icon = '<i class="icon iconfont" style="color:#f9379a;">&#xe600;</i>';
        }

        $('.profile-page .user-name').text(my_name);
        $('.profile-page .user-avatar').attr('src', avatar_src);
        $('.profile-page .user-info').html('<span>' + sex_icon + '</span><span>'
            + my_age + '</span><span>' + '北京' + '</span>');

        Face.gets_by_user(me2er, function(faces){
            $.each(faces, function(index, face){
                var point = face.get('point'),
                    point_name = point.get('name');

                Story.gets_by_face(face, function(storys){
                    if (storys.length) {
                        var story = storys[0],
                            story_image = get_image_url(story, 2),
                            story_text = story.get('text');
                    }                    
                    addFaceItem(face.id, point_name, story_image, story_text);
                });
            });
        });
    });
    /* get hosts point */
    function generateHotList(points, $ul){
        var tmpl = '';
        $.each(points, function(index, item){
            tmpl += '<li class="item-content">'
                 +  '   <div class="item-inner">'
                 +  '        <div class="item-title">' + item.get('name') + '</div>'
                 +  '   </div>'
                 +  '</li>'
        });
        $ul.html(tmpl);
    }
    Point.get_hots(function(points){
        generateHotList(points, $('.hot-point-list ul'));
    });
});

var conversationStarted = false,
    showDate = false,
    last_Date = null;

myApp.onPageBeforeInit('chat', function(page) {

    var query = page.query,
        other_name = query['other_name'];

    var my_name = av_current_user.get('name'),
        my_avatar = get_image_url(av_current_user, 1);

    showDate = true;
    last_Date = null;

    $('.chat-with.center').text('与' + other_name + '聊天');
    if (query['point_name']) {
        var point_name = query['point_name'],
            story_text = query['story_text'],
            story_image = query['story_image'],
            story_id = query['story_id'];

        var $story_preview = $(
            '<div class="messagebar story-preview-wrap">' + 
            '    <div class="current-story">' + 
            '       <img src="' + story_image + '" alt="" width="46" height="46">' +
            '       <div class="tiny-point-name">' + point_name + '</div>' +
            '    </div>' +
            '    <div class="tiny-story-text">' + story_text + '</div>' + 
            '</div> ');
        $story_preview.insertBefore($('.sys-bar'));
        $('.story-pic-preview img').attr('src', story_image);
        $('.tiny-point-name').text(point_name);
        $('.tiny-story-text').text(story_text);
    }
    if (query['other_id']) {
        Me2er.get_by_id(query['other_id'], function(me2er){
            av_card_user = me2er;
            getHistoryMessage(me2er, av_current_user);
        });
    } else {
        getHistoryMessage(av_card_user, av_current_user);
    }


    // Handle message
    $$('.messagebar .link').on('click', function() {
        var textarea = $$('.messagebar textarea');
        var messageText = textarea.val().trim();
        if (messageText.length === 0) return;
        textarea.val('').trigger('change');

        //add_message_origin(messageText, 'sent', my_avatar, my_name, new Date());

        if ($('.story-preview-wrap').length > 0) {
            // 某个故事的回应 -- 第一条message
            $('.story-preview-wrap').remove();
            //add_message_story(query['point_name'], query['story_image'], query['story_text']);
            Story.get_by_id(query['story_id'], function(story){
                Message.send_reply(av_current_user, av_card_user, messageText, story);
            });
        } else {
            Message.send_msg(av_current_user, av_card_user, messageText);
        }
    });
   
});

// 轮询-- 消息提醒呦
loopNotice();

function loopNotice(){
    Notice.gets_by_user(av_current_user, function(notices){
        if (notices.length > 0) {
            $('.unread-tip').css('opacity', 1);
        }
        setTimeout(function(){
            loopNotice();
        }, 3000);
    });
}

function add_message_story(point_name, story_image, story_text){
    var tmp = '<div class="message message-story">' + 
                   '    <div>' +
                   '        <span>' + point_name + '</span>' + 
                   '        <p>' + story_text + '</p>' + 
                   '    </div>' +
                   '    <img width="40" height="40" src="' + story_image + '" alt="">' +
                   '</div>',
        message_item = $(tmp);
    $('.chat-page .messages').append(message_item);
}

function add_message_origin(text, type, avatar, name, date){
    var day = get_format_day(date),
        time = get_format_time(date);
    if (last_Date) {
        var period = date.getTime() - last_Date.getTime();
        if (period > 3600000){
            showDate = true;
            last_Date = date;
        } else {
            showDate = false;
        }
    } else {
        last_Date = date;
    }

    myApp.addMessage({
        text: text,
        type: type,
        avatar: avatar,
        name: name,
        day: showDate ? day : false,
        time: showDate ? time : false
    });
}

var latest_time_stamp = null;

function getHistoryMessage(user_from, user_to){
    Message.gets_by_user(user_from, user_to, function(messages, time){
        console.log('mesages count: ' + messages.length);
        var last_time = time;
        var i = 0, len = messages.length;
        if (len){
            // 递归
            addMessageItem(messages, i, len);
        }

        // todo: add 最新的消息轮询
        console.log('-------1111111111--------');
        console.log(last_time);
        loop_chat(user_from, user_to, last_time);
    });
}

function loop_chat(user_from, user_to, last_time){
    Message.loop_gets_by_user(user_from, user_to, last_time, function(new_msgs, time){
        console.log(new_msgs);
        var i = 0, len = new_msgs.length;
        if (len){
            // 递归
            console.log('***************');
            console.log(len);
            addMessageItem(new_msgs, i, len);
        }        
        setTimeout(function(){
            loop_chat(user_from, user_to, time);
        }, 3000);
    });
}

function addMessageItem(messages, i ,len){
    var message = messages[i];
    var type = message.get('type'),
        text = message.get('text'),
        avatar = get_image_url(message.get('user_from')),
        name = message.get('user_from').get('name'),
        date = fix_utc_date(message.createdAt),
        s_or_r = '';
    if (message.get('user_from').id == av_current_user.id){
        s_or_r = 'sent';
    } else {
        s_or_r = 'received'
    }
    console.log(type);
    if (type === 3) {
        // 带着story 缩略图
        var story = message.get('story'),
            story_image = get_image_url(story),
            story_text = story.get('text');
        story.get_point_name(function(point_name){
            add_message_origin(text, s_or_r, avatar, name, date);
            add_message_story(point_name, story_image, story_text);
            if ( (i+1) < len){
                addMessageItem(messages, i+1 , len);
            } 
        });

    }else if (type === 2){
        add_message_origin(text, s_or_r, avatar, name, date);
        if ( (i+1) < len){
            addMessageItem(messages, i+1 , len);
        } 
    } else if (type === 1){
        // todo: 添加系统解锁消息
        add_message_origin(text, s_or_r, avatar, name, date);
        if ( (i+1) < len){
            addMessageItem(messages, i+1 , len);
        } 
    }
}

function fix_utc_date(date){
    var utc = date.toUTCString();
    var utcInitTime = new Date(utc);
    var index = utc.indexOf('GMT');
    var utcInitTimeNoGMT = new Date(utc.substring(0, index));
    return utcInitTimeNoGMT;
}

function get_format_day(date){
    var year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate();
    return year + '-' + month + '-' + day ; 
}

function get_format_time(date){
    var hour = date.getHours(),
        minute = date.getMinutes();
    return hour + ':' + minute; 
}

myApp.onPageBeforeInit('all_message', function(page){
    Notice.remove(av_current_user, function(){
        $('.unread-tip').css('opacity', 0);
    });
    Dialog.gets_by_user(av_current_user, function(dialogs){
        console.log('dialog count: ' + dialogs.length); 
        $.each(dialogs, function(index, dialog){
            addDialogItem(dialog);
        });

    });
});
function addDialogItem(dialog){
    var user_from = dialog.get('user_from'),
        user_to = dialog.get('user_to'),
        display_user = user_from,
        latest_message = dialog.get('latest_message');
    if (user_from.id === av_current_user.id) {
        display_user = dialog.get('user_to');
    }
    var user_image = get_image_url(display_user, 1),
        user_name = display_user.get('name'),
        other_id = display_user.id;
    var tmpl = '<li>' +
               '    <a href="chat.html?other_name=' + user_name + '&other_id=' + other_id + '" class="item-link item-content">' +
               '        <div class="item-media"><img width="50" height="50" src="' + user_image + '"></div>' +
               '            <div class="item-inner">' +
               '                <div class="item-subtitle">' + user_name + '<span class="m_time"></span></div>' +
               '                <div class="item-text">' + latest_message + '</div>' +
               '            </div>' +
               '        </div>' +
               '    </a>' + 
               '</li>',
        $dialog_item = $(tmpl);

    $('.dialog-list').prepend($dialog_item);
}

function get_image_url(obj, type){

    var image = obj.get('image'),
        default_url = (type==1) ? '/img/default_avatar.png' : '/img/large_default_bg.png';
    return image ? image.url() : default_url;
}
