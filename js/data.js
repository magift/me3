
var Point = AV.Object.extend("Point", {
    //name, count       
}, {
    get_hots: function(succ_func){
        var query = new AV.Query(Point);
                query.descending('count').limit(50);
                query.find({
                        success: function(points){
                                succ_func && succ_func(points);  
                        }
                })
        },
    add: function(name, succ_func){
        var query = new AV.Query(Point);
        query.equalTo('name', name);
        return query.find({
            success: function(results) {
                if (results.length) {
                    return succ_func && succ_func(results[0]);
                }
                else {
                    var point = new Point();
                    point.set('name', name);
                    point.set('count', 0);
                    return point.save(null, {success:function(point){succ_func && succ_func(point);}}); 
                }
            }
        })
    },
    get_by_id: function(id, succ_func){
        var query = new AV.Query(Point);
        query.get(id, {
            success: function(point) {
                succ_func && succ_func(point);
            }
        })
    }
});

var Story = AV.Object.extend("Story", {
    //image, text, face
    get_point_name: function(succ_func){
        var query = new AV.Query(Story);
        query.equalTo('objectId', this.id)
        query.find({
            success: function(storys) {
                var query = new AV.Query(Face);
                query.equalTo('objectId', storys[0].get('face').id).include('point');
                query.find({
                    success: function(faces) {
                        succ_func(faces[0].get('point').get('name'));
                    }
                })
            }
        })
    }
}, {
    add: function(face, image, text, succ_func){
        Story.gets_by_face(face, function(storys){
            var story = storys.length ? storys[0] : new Story();
            story.set('face', face);
            if (image) {
                console.log('svae image');
                console.log(image);
                story.set('image', image);
            }
            story.set('text', text);
            story.save(null, {success:function(story){succ_func && succ_func(story)}});
        });
    },
    gets_by_face: function(face, succ_func){
        var query = new AV.Query(Story);    
        query.equalTo('face', face).descending('updatedAt').include('face');    
        query.find({
                success: function(storys) {
                    succ_func && succ_func(storys);
                }
        });
    },
    get_by_id: function(id, succ_func){
        var query = new AV.Query(Story);
        query.get(id, {
            success: function(story) {
                succ_func && succ_func(story);
            }
        })
    }
});

var Image = AV.Object.extend("Image", {}, {
        add: function(image, succ_func) {
            var filename = image.name || 'a.jpg',
            pos = filename.lastIndexOf('.'),
            ext = filename.substring(pos),
            name = + new Date().getTime() + ext;

            f = new AV.File(name, image);
            f.save().then(function(file){
                succ_func && succ_func(file);
            }, function(error){
                console.log(error);
            });
        }   
});

var Notice = AV.Object.extend("Notice", {
   //user 
}, {
    add: function(user) {
        var notice = new Notice();
        notice.set('user', user);
        notice.save();
    },
    remove: function(user, succ_func) {
        var query = new AV.Query(Notice);
        query.equalTo('user', user).destroyAll({
            success: function(){succ_func();}            
        });
    },
    gets_by_user: function(user, succ_func) {
        var query = new AV.Query(Notice);
        query.equalTo('user', user).find({
            success: function(notices){
               succ_func && succ_func(notices);
            }
        });
    }
}
);

var Face = AV.Object.extend("Face", {
    //point, user, 
}, {
    add: function(user, point, succ_func){
        Face.get_by_user_point(user, point, function(face){
            console.log(face);
            if(!face) {
                face = new Face();
                face.set('point', point);
                point.increment('count');
                point.save();
                face.set('user', user);
                face.set('first_add', true);
            } else {
                face.set('first_add', false);
            }
            return face.save(null, {success:function(face){succ_func && succ_func(face);}});
        });
    },
    gets_by_user: function(user, succ_func){
        var query = new AV.Query(Face);
        query.equalTo('user', user).ascending('updatedAt').include('point');
        query.find({
            success: function(faces){
                succ_func && succ_func(faces);
            }
        });
    },
    get_by_user_point: function(user, point, succ_func){
        var query = new AV.Query(Face);
        query.equalTo('point', point).equalTo('user', user).include('point');
        query.find({
            success: function(faces) {
                if (faces.length) {
                    succ_func && succ_func(faces[0]);
                }
                else {
                    succ_func && succ_func(null);
                }
            }
        })

    },
    get_by_id: function(id, succ_func){
        var query = new AV.Query(Face);
        query.get(id, {
            success: function(face) {
                succ_func && succ_func(face);
            }
        })
    },
    unlock: function(user, face, succ_func) {
        var user_from = user;
        var user_to = face.get('user');
        UnlockedFace.add(face, user, function(){
            Chance.add(user_to, user_from);
            // TODO  一次是写死的！
            succ_func && succ_func(face, '你还有1次解锁机会');
            console.log(face.get('point'));
            Point.get_by_id(face.get('point').id, function(point){
                Me2er.get_by_id(face.get('user').id, function(user_to){
                Message.send_sys_msg(user_from , user_to, user_from.get('name') + '解锁了' + user_to.get('name') + '的' + point.get('name'));
                })
            });
            // ##TODO 同时把对方挪出队列
        })
    },
    remove: function() {}
});

var UnlockedFace = AV.Object.extend("UnlockedFace",{
    //face, user
}, {
    add: function(face, user, succ_func) {
        var unlocked_face = new UnlockedFace();        
        unlocked_face.set('face', face);
        unlocked_face.set('user', user);
        unlocked_face.save(null, {
            success:function(uface){
                succ_func && succ_func(uface);
            }
        })
    },
    is_unlocked: function(face, user, succ_func) {
        var query = new AV.Query(Story);
        Story.gets_by_face(face, function(storys){
            if(storys.length == 0) {
                succ_func(true);
            }
            else {
                var query = new AV.Query(UnlockedFace); 
                query.equalTo('face', face).equalTo('user', user);
                query.find({
                    success: function(ufaces){
                        if(ufaces.length > 0) {
                            succ_func(true);
                        } 
                        else {
                            succ_func(false);
                        }
                    }
                });
            }
        })

    }
})

var Dialog = AV.Object.extend("Dialog", {
    //user_from, user_to, latest_message
}, {
        gets_by_user: function(user_to, succ_func){
            var from_query = new AV.Query(Dialog);
            from_query.equalTo('user_from', user_to);
            var to_query = new AV.Query(Dialog);
            to_query.equalTo('user_to', user_to);

            var query = AV.Query.or(from_query, to_query).descending('updatedAt').include('user_from').include('user_to');
            query.find({
                success: function(dialogs) {succ_func && succ_func(dialogs);}
            })
        },
        add: function(user_from, user_to, message, succ_func) {
            var from_query = new AV.Query(Dialog);
            from_query.equalTo('user_from', user_from).equalTo('user_to', user_to)
            var to_query = new AV.Query(Dialog);
            to_query.equalTo('user_from', user_to).equalTo('user_to', user_from)

            var query = AV.Query.or(from_query, to_query)
            query.find({
                success: function(dialogs) {
                    if (dialogs.length) {
                        dialogs[0].set('latest_message', message || '');
                        dialogs[0].save(null, {
                            success: function(){
                                succ_func && succ_func(dialogs);
                            }
                        });
                    }
                    else {
                        var dialog = new Dialog();
                        dialog.set('user_from', user_from);
                        dialog.set('user_to', user_to);
                        dialog.set('latest_message', message || '');
                        dialog.save(null, {
                            success: function(){
                                succ_func && succ_func(dialogs);
                            }, 
                        });
                    }
                }
            })
        }
});

var Message = AV.Object.extend("Message", {
    //image, text, type, user_from, user_to
}, {
        add: function(user_from, user_to, image, text, type, story, succ_func){
                var message = new Message();
                message.set('user_from', user_from);
                message.set('user_to', user_to);
                message.set('image', image);
                message.set('text', text);
                message.set('type', type);
                message.set('story', story);
                message.save(null, {
                    success: function(msg) {
                        succ_func && succ_func(msg);
                        }});
                Dialog.add(user_from, user_to, text);
                Notice.add(user_to);
        },
        send_sys_msg: function(user_from, user_to, text, succ_func){
                Message.add(user_from, user_to, null, text, 1, null, succ_func);
        },
        send_msg: function(user_from, user_to, text, succ_func){
                Message.add(user_from, user_to, null, text, 2, null, succ_func);
        },
        send_reply: function(user_from, user_to, text, story, succ_func){
                Message.add(user_from, user_to, null, text, 3, story, succ_func);
        },
        gets_by_user: function(user_from, user_to, succ_func) {
            var from_query = new AV.Query(Message);
            from_query.equalTo('user_from', user_from).equalTo('user_to', user_to)
            var to_query = new AV.Query(Message);
            to_query.equalTo('user_from', user_to).equalTo('user_to', user_from)

            var query = new AV.Query.or(from_query, to_query).ascending('createdAt').limit(100).include('user_to').include('user_from').include('story');
            query.find({
                success: function(messages){
                    var time = null;
                    if(messages.length > 0){
                        time = messages[messages.length-1].createdAt;
                    }
                    succ_func && succ_func(messages, time);
                }
            });
        },
        loop_gets_by_user: function(user_from, user_to, lasttime, succ_func) {
            var _ = function(messages, time) {
                var new_msgs = messages.filter(function(msg){
                    //console.log(msg.createdAt);
                    //console.log(lasttime);
                    return msg.createdAt > lasttime; 
                    });
                succ_func(new_msgs, time);  
            }
            Message.gets_by_user(user_from, user_to, _); 
        }
});

var Chance = AV.Object.extend("Chance", {
    //count, user_from, user_to
}, {
   add: function(user_from, user_to, succ_func) {
        var query = new AV.Query(Dialog);
        query.equalTo('user_from', user_from).equalTo('user_to', user_to);
        query.find({
            success: function(chances) {
                if (chances.length) {
                    chance = chances[0];
                    chance.increment('count');
                    succ_func && succ_func(chance);
                }
                else {
                    var chance = new Chance();  
                    chance.set('user_from', user_from);
                    chance.set('user_to', user_to);
                    chance.set('count', 1);
                    succ_func && succ_func(chance);
                }                    
            }
        });
   }, 
   get_by_user: function(user_from, user_to, succ_func) {
        var query = new AV.Query(Chance);
        query.equalTo('user_from', user_from).equalTo('user_to', user_to);            
        query.find({
            success: function(chances) {
                if (chances.length) {
                    succ_func && succ_func(chances[0]);
                }
                else {
                    Chance.add(user_from, user_to, succ_func);
                }
            }

        });
   }
});

var Me2er = AV.Object.extend("Me2er", {
   /*
    name, sex, age, image, user_list
    */
    can_see: function(face, succ_func){
        UnlockedFace.is_unlocked(face, this, succ_func)
    },
    change_user: function(succ_func) {
        // TOTO 暂时只是简单随机
        var query = new AV.Query(Me2er);
        //console.log(this.get('name'));
        query.notEqualTo('name', this.get('name'));
        query.find({
            success: function(users) {
                var rand = parseInt(Math.random()*users.length);
                //TODO 写死了
                //如果没有
                succ_func(users[rand], '你有2次解锁机会');                
            }
        });
    },
    get_faces_by_other: function(other, succ_func){
        // TODO 排序逻辑没写
        // 1 未解锁的 2 已解锁的
        // a 有故事的 b 没故事的
        Face.gets_by_user(other, function(faces){
            var pos = 1;
            succ_func(faces, pos);
        })
    },
    get_same_faces: function(other, succ_func) {
        var me_func = function(faces) {
            var same_faces = new Array();
            var other_func = function(other_faces) {
                var k = 0;
                for (var i=0; i<other_faces.length; i++) {
                    var o_face = other_faces[i];
                    for (var j=0; j<faces.length; j++) {
                        var m_face = faces[j];
                        if (m_face.get('point').get('name') == o_face.get('point').get('name')){
                            same_faces[k] = o_face;
                            k = k + 1;
                        }
                    }
                }
                succ_func && succ_func(same_faces);
            }
            Face.gets_by_user(other, other_func);
        };
        Face.gets_by_user(this, me_func);
    },
    count_same_faces: function(other, succ_func){
        this.get_same_faces(other, function(faces){
            succ_func(faces.length);
        });
    },
    count_diff_faces: function(other, succ_func){
        this.count_same_faces(other, function(same_count){
            Face.gets_by_user(other, function(other_faces){
                succ_func(other_faces.length - same_count);                
            });            
        });
    },
    init_user_list: function(){
    }
},{
    get_current: function(succ_func){
        var user = AV.User.current(),
        query = new AV.Query(Me2er);
        query.equalTo('account', user).include('user');
        query.find({
            success: function(me2er){
                var me2er = me2er[0];
                succ_func(me2er);
            }
        });
    },
    login: function(username, passwd){
    },
    gets_by_point: function(point, succ_func) {
        var query = new AV.Query(User);
        query.equalTo('point', point);
        query.find({
            success: function(users){
                succ_func(users);
            }
        });
    },
    add: function(name, sex, age, image, succ_func, fail_func){
        var user = new AV.User();
        user.set('username', name);
        user.set('password', name);

        return user.signUp(null, {
            success: function(user){
                var new_user = new Me2er();
                new_user.set('name', name);
                new_user.set('sex', sex);
                new_user.set('age', age);
                new_user.set('account', user);
                new_user.set('image', image); 

                new_user.save(null, {
                    success:function(new_user) {
                        succ_func && succ_func(new_user);
                },
                    error:function(new_user, error){
                        console.log(new_user.id);
                        console.log(error);
                    }
                });
            }
        });
    },
    get_by_id: function(id, succ_func) {
        var query = new  AV.Query(Me2er);
        query.get(id, {
            success: function(me2er) {
                succ_func && succ_func(me2er);
            }
        })
    }
});
