var Init = {
    init_image: function() {
        var bytes = [ 0xBE, 0xEF, 0xCA, 0xFE ];
        Image.add(bytes, function(image){
            console.log(image.url());
            assert(image.url());
            Init.image = image;
            Init.init_me();
        })
    },
    init_me: function(){ 
        random = Math.random().toString();
        return Me2er.add(random, 'sex', 'age', Init.image, 
            function(user){
                Init.me = user;
                Init.init_other();
            });
    },
    init_other: function(){
        random = Math.random().toString();
        return Me2er.add(random, 'sex', 'age', Init.image, 
            function(user){
                Init.other = user;
                Init.init_point();
            });
    },
    init_point: function(){ 
        var points = ['北漂','八零后','八零后','猫','猫','猫'];
        for (var i=0; i<points.length; i++){
            random = Math.random().toString();
            Point.add(random, function(point){
                Face.add(Init.me, point, function(face){
                    Story.add(face, null, 'hello');                    
                })
            });
        }

        return Point.add('北漂', 
            function(point){
                Init.point = point;
                assert(Init.point.get('count') == 0);
                Init.init_face();
        });
    },
    init_face: function(){
        return Face.add(Init.me, Init.point,
            function(face){
                Init.face = face;
                console.log(Init.face.get('point').get('name'));
                assert(Init.face.get('point').get('name') == Init.point.get('name'));

                Face.add(Init.other, Init.point,
                    function(face) {
                        Init.init_diff_face();
                    })
            });
    },
    init_diff_face: function(){
        var random = Math.random().toString();
        Point.add(random,
            function(point){
                Face.add(Init.other, point, function(face){
                    Init.diff_face = face;
                    Story.add(face, Init.image, 'haha', function(story){
                        Init.init_story();
                    })
                })
            }
        );
    },
    init_story: function(){
        return Story.add(Init.face, Init.image, 'hello', 
            function(story){
                Init.story = story;
                Test['test_get_hots']();
                //for(var i in Test){
                //    Test[i]();
                //}
        });
    },
}

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}


var Test = {
    test_get_hots: function() {
        Point.get_hots(function(points){
            for(var i=0; i<points.length - 1; i++) {
                assert(points[i].get('count') >= points[i+1].get('count'));
            }
            Test['test_add_face']();
        });
    },
    test_add_face: function() {
        Face.add(Init.me, Init.point, function(face){
            assert(face.get('user'), Init.me);
            Test['test_gets_face_by_user']();
        }) 
    },
    test_gets_face_by_user: function() {
        Face.gets_by_user(Init.me, function(faces){
            console.log(faces[0].get('point').get('name'));
            Test['test_gets_face_by_user_point']();
        })
    },
    test_gets_face_by_user_point: function() {
        Face.get_by_user_point(Init.me, Init.point, function(face){
            console.log(face);
            Test['test_change_user']();
        })
    },
    test_change_user: function() {
        Init.me.change_user(function(user){
            console.log(user);
            Test['test_get_same_faces']();
        });
    },
    test_get_same_faces: function() {
        Init.me.get_same_faces(Init.other, function(faces){
            assert(faces.length == 1, 'get same faces');
            Test['test_count_same_faces']();
        })
    },
    test_count_same_faces: function(){
        Init.me.count_same_faces(Init.other, function(count){
            assert(count == 1);
            Test['test_count_diff_faces']();
        })
    },
    test_count_diff_faces: function(){
        Init.me.count_diff_faces(Init.other, function(count){
            assert(count == 1);
            Test['test_can_see']();
        })
    },
    test_can_see: function(){
        Init.me.can_see(Init.diff_face, function(bool){
            assert(bool == false);
            Test['test_add_message']();
        })
    },
    test_add_message: function(){
        Message.add(Init.other, Init.me, Init.image, 'hello', 
            null, null, function(message){
                assert(message.get('text') == 'hello');
                assert(message.get('user_from') == Init.other);
                assert(message.get('user_to') == Init.me);
                Message.gets_by_user(Init.other, Init.me, 
                    function(messages){
                        console.log(messages[0].get('text'))
                        assert(messages.length == 1);
                        Test['test_loop_message']();
                    });
             })
    },
    test_loop_message: function() {
        Message.loop_gets_by_user(Init.other, Init.me, null, function(message){
        assert(message.length == 1);
        Test['test_unlock']();
        });
    },
    test_unlock: function(){
        Face.unlock(Init.me, Init.diff_face, function(face){
            Init.me.can_see(face, function(bool){
                assert(bool == true);
                Test['test_diolog']();
            })
        });
    },
    test_diolog: function(){
        Dialog.gets_by_user(Init.other, function(dialogs){
            Dialog.add(Init.me, Init.other, 'hello too', function(dialogs){
                Dialog.gets_by_user(Init.other, function(dialogs){
                    console.log(dialogs);
                    assert(dialogs.length == 1);
                    Test['test_send_message']();
                })
            })
        });
    },
    test_send_message: function(){
        Message.send_msg(Init.me, Init.other, 'haha', function(){
                Test['test_story_get_point_name']();
        })
    },
    test_story_get_point_name: function(){
        Init.story.get_point_name(function(point_name){
            console.log(point_name);
            assert(point_name == Init.point.get('name'));
            console.log('Test ok!');
        });
    }
}

var classes = new Array(Point, Story, Image, Notice, Face, UnlockedFace, Dialog,Message, Me2er, Chance);
var i = 0;
for(var i=0; i<classes.length; i++) {
    var query = new AV.Query(classes[i]);
    query.notEqualTo('objectId', '')
    query.destroyAll({
        success: function(){
        },
    });
}

Init.init_image();


