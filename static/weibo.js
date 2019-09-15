// Weibo API
// 获取所有 weibo
var apiWeiboAll = function(callback) {
    var path = '/weibo/all'
    ajax('GET', path, '', callback)
}

var apiWeiboAdd = function(form, callback) {
    var path = '/weibo/add'
    ajax('POST', path, form, callback)
}

var apiWeiboDelete = function(weibo_id, callback) {
    var path = `/weibo/delete?id=${weibo_id}`
    ajax('GET', path, '', callback)
}

var apiWeiboUpdate = function(form, callback) {
    var path = '/weibo/update'
    ajax('POST', path, form, callback)
}

var apiCommentAdd = function(form, callback) {
    var path = '/comment/add'
    ajax('POST', path, form, callback)
}

var apiCommentDelete = function(comment_id, callback) {
    var path = `/comment/delete?id=${comment_id}`
    ajax('GET', path, '', callback)
}

var apiCommentUpdate = function(form, callback) {
    var path = '/comment/update'
    ajax('POST', path, form, callback)
}

var weiboTemplate = function(weibo) {
    var t = `
        <p>
            <div class="weibo-cell" data-id="${weibo.id}">
                <span class="weibo-content">${weibo.content}</span>
                <span class="weibo-user">from ${weibo.username}</span>
                <button class="weibo-delete">删除</button>
                <button class="weibo-edit">更改</button>
    `
    return t
}

//这上下两个字符串会在insertWeibo函数里拼接再一起

var commentAddTemplate = function(weibo) {
    var t = `
                <div class="comment-add-form">
                    <input class="comment-add-input">
                    <br>
                    <button class="comment-add">添加评论</button>
                </div>
            </div>
        </p>
    `
    return t
}

var commentTemplate = function(comment) {
    var t = `
        <div class="comment-cell" data-id="${comment.id}">
            <span class="comment-user">&nbsp&nbsp&nbsp ${comment.username} : </span>
            <span class="comment-content">${comment.content}</span>
            <button class="comment-delete">删除</button>
            <button class="comment-edit">更改</button>
        </div>
    `
    return t
}

var weiboUpdateTemplate = function(content) {
    var t = `
        <div class="weibo-update-form">
            <input class="weibo-update-input" value="${content}">
            <button class="weibo-update">更新</button>
        </div>
    `
    return t
}

var commentUpdateTemplate = function(content) {
    var t = `
        <div class="comment-update-form">
            <input class="comment-update-input" value="${content}">
            <button class="comment-update">更新</button>
        </div>
    `
    return t
}

var insertWeibo = function(weibo) {
    var weiboCell = weiboTemplate(weibo)
    log('微博内容', weibo)
    var comments = weibo.comments
    log('评论内容', comments)
    for(var i = 0; i < comments.length; i++) {
            var comment = comments[i]
            var commentCell = commentTemplate(comment)
            var weiboCell = weiboCell + commentCell
    }

    var weiboCell = weiboCell + commentAddTemplate(weibo)
    var weiboList = e('#id-weibo-list')
    weiboList.insertAdjacentHTML('beforeend', weiboCell)
}


var insertUpdateForm = function(content, weiboEdit) {
    var updateForm = weiboUpdateTemplate(content)
    weiboEdit.insertAdjacentHTML('afterEnd', updateForm)
}

var insertCommentUpdateForm = function(content, commentEdit) {
    var updateForm = commentUpdateTemplate(content)
    commentEdit.insertAdjacentHTML('afterEnd', updateForm)
}

var loadWeibos = function() {

    apiWeiboAll(function(weibos) {
        log('load all weibos', weibos)
        // 循环添加到页面中
        for(var i = 0; i < weibos.length; i++) {
            var weibo = weibos[i]
            log('weibo[i]内容', weibo)
            insertWeibo(weibo)
        }
    })

}

var bindEventWeiboAdd = function() {
    var b = e('#id-button-add')
    // 注意, 第二个参数可以直接给出定义函数
    b.addEventListener('click', function(){
        var input = e('#id-input-weibo')
        var content = input.value
        log('click add', content)
        var form = {
            content: content,
        }
        apiWeiboAdd(form, function(weibo) {
            // 收到返回的数据, 插入到页面中
            insertWeibo(weibo)
        })
    })
}


var bindEventWeiboDelete = function() {
    var weiboList = e('#id-weibo-list')
    // 事件响应函数会传入一个参数 就是事件本身
    weiboList.addEventListener('click', function(event) {
    log(event)
    // 我们可以通过 event.target 来得到被点击的对象
    var self = event.target
    log('被点击的元素', self)
    // 通过比较被点击元素的 class
    // 来判断元素是否是我们想要的
    // classList 属性保存了元素所有的 class
    log(self.classList)
    if (self.classList.contains('weibo-delete')) {
        log('点到了删除按钮')
        weiboId = self.parentElement.dataset['id']
        apiWeiboDelete(weiboId, function(r) {
            log('apiWeiboDelete', r.message)
            // 以返回的message来判断用户是否有权限删除该weibo
            if (r.message=="成功删除 weibo") {
                self.parentElement.remove()
                alert(r.message)
            } else {
                alert(r.message)
            }
        })
    } else {
        log('点到了 weibo cell')
    }
})}

var bindEventWeiboEdit = function() {
    var weiboList = e('#id-weibo-list')
    // 事件响应函数会传入一个参数 就是事件本身
    weiboList.addEventListener('click', function(event) {
    log(event)
    // 我们可以通过 event.target 来得到被点击的对象
    var self = event.target
    log('被点击的元素', self)
    // 通过比较被点击元素的 class
    // 来判断元素是否是我们想要的
    // classList 属性保存了元素所有的 class
    log(self.classList)
    if (self.classList.contains('weibo-edit')) {
        log('点到了编辑按钮')
        weiboCell = self.closest('.weibo-cell')
        weiboId = weiboCell.dataset['id']
        var weiboSpan = e('.weibo-content', weiboCell)
        var content = weiboSpan.innerText
        // 插入编辑输入框
        var weiboEdit = e('.weibo-edit', weiboCell)
        insertUpdateForm(content, weiboEdit)
    } else {
        log('点到了 weibo cell')
    }
})}

var bindEventWeiboUpdate = function() {
    var weiboList = e('#id-weibo-list')
    // 事件响应函数会传入一个参数 就是事件本身
    weiboList.addEventListener('click', function(event) {
    log(event)
    // 我们可以通过 event.target 来得到被点击的对象
    var self = event.target
    log('被点击的元素', self)
    // 通过比较被点击元素的 class
    // 来判断元素是否是我们想要的
    // classList 属性保存了元素所有的 class
    log(self.classList)
    if (self.classList.contains('weibo-update')) {
        log('点到了更新按钮')
        weiboCell = self.closest('.weibo-cell')
        weiboId = weiboCell.dataset['id']
        log('update weibo id', weiboId)
        input = e('.weibo-update-input', weiboCell)
        content = input.value
        var form = {
            id: weiboId,
            content: content,
        }

        apiWeiboUpdate(form, function(weibo) {
            // 收到返回的数据, 插入到页面中
            log('apiWeiboUpdate', weibo)
            // 以返回的message来判断用户是否有权限更改该weibo
            if (!weibo.message) {
                var weiboSpan = e('.weibo-content', weiboCell)
                weiboSpan.innerText = weibo.content

                var updateForm = e('.weibo-update-form', weiboCell)
                updateForm.remove()
            } else {
                alert(weibo.message)
            }
        })
    } else {
        log('点到了 weibo cell')
    }
})}

var bindEventCommentAdd = function() {
    var weiboList = e('#id-weibo-list')
    weiboList.addEventListener('click', function(event) {
    log(event)
    var self = event.target
    log('被点击的元素', self)
    log(self.classList)
    if (self.classList.contains('comment-add')) {
        log('点到了添加评论按钮')

        weiboCell = self.closest('.weibo-cell')
        weiboId = weiboCell.dataset['id']
        log('update weibo id', weiboId)
        commentAdd = e('.comment-add-form', weiboCell)
        input = e('.comment-add-input', commentAdd)
        content = input.value
        var form = {
            weibo_id: weiboId,
            content: content,
        }

        apiCommentAdd(form, function(weibo) {
            // 直接在改weibo下加上一条评论，加在'添加评论'的上方
            var commentAddForm = e('.comment-add-form', weiboCell)
            commentAddForm.insertAdjacentHTML('beforeBegin', commentTemplate(weibo))
        })
    } else {
        log('点到了 weibo cell')
    }
})}

var bindEventCommentDelete = function() {
    var weiboList = e('#id-weibo-list')
    // 事件响应函数会传入一个参数 就是事件本身
    weiboList.addEventListener('click', function(event) {
    log(event)
    // 我们可以通过 event.target 来得到被点击的对象
    var self = event.target
    log('被点击的元素', self)

    log(self.classList)
    if (self.classList.contains('comment-delete')) {
        log('点到了评论删除按钮')
        commentId = self.parentElement.dataset['id']
        apiCommentDelete(commentId, function(r) {
            log('apiWeiboDelete', r.message)
            // 以返回的message来判断用户是否有权限删除该评论
            if (r.message=="成功删除 comment") {
                self.parentElement.remove()
                alert(r.message)
            } else {
                alert(r.message)
            }
        })
    } else {
        log('点到了 weibo cell')
    }
})}

// 评论编辑按钮处理函数
var bindEventCommentEdit = function() {
    var weiboList = e('#id-weibo-list')
    // 事件响应函数会传入一个参数 就是事件本身
    weiboList.addEventListener('click', function(event) {
    log(event)
    // 我们可以通过 event.target 来得到被点击的对象
    var self = event.target
    log('被点击的元素', self)

    log(self.classList)
    if (self.classList.contains('comment-edit')) {
        log('点到了评论编辑按钮')
        commentCell = self.closest('.comment-cell')
        commentId = commentCell.dataset['id']
        var commentSpan = e('.comment-content', commentCell)
        var content = commentSpan.innerText
        // var content = weiboSpan.innerText
        // 插入编辑输入框
        var commentEdit = e('.comment-edit', commentCell)
        insertCommentUpdateForm(content, commentEdit)
    } else {
        log('点到了 weibo cell')
    }
})}

var bindEventCommentUpdate = function() {
    var weiboList = e('#id-weibo-list')
    // 事件响应函数会传入一个参数 就是事件本身
    weiboList.addEventListener('click', function(event) {
    log(event)
    // 我们可以通过 event.target 来得到被点击的对象
    var self = event.target
    log('被点击的元素', self)

    log(self.classList)
    if (self.classList.contains('comment-update')) {
        log('点到了评论更新按钮')
        commentCell = self.closest('.comment-cell')
        commentId = commentCell.dataset['id']
        log('update comment id', commentId)
        input = e('.comment-update-input', commentCell)
        content = input.value
        var form = {
            id: commentId,
            content: content,
        }

        apiCommentUpdate(form, function(comment) {
            // 收到返回的数据, 插入到页面中
            log('apiCommentUpdate', comment)
            // 以返回的message来判断用户是否有权利更改该评论
            if (!comment.message) {
                var commentSpan = e('.comment-content', commentCell)
                commentSpan.innerText = comment.content

                var updateForm = e('.comment-update-form', commentCell)
                updateForm.remove()
            } else {
                alert(comment.message)
            }
        })
    } else {
        log('点到了 weibo cell')
    }
})}


var bindEvents = function() {
    bindEventWeiboAdd()
    bindEventWeiboDelete()
    bindEventWeiboEdit()
    bindEventWeiboUpdate()
    bindEventCommentAdd()
    bindEventCommentDelete()
    bindEventCommentEdit()
    bindEventCommentUpdate()
}

var __main = function() {
    bindEvents()
    loadWeibos()
}

__main()
