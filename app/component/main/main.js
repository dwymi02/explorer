

var vAppTotalSupply = new Vue({
    el: '#totalsupply',
    data: {
        minted_diamond: "-", // The number of diamonds that have been minted successfully
        transferred_bitcoin: "-",
        miner_reward: "-", // Block reward HAC accumulation
        channel_interest: "-", // Channel interest HAC accumulation
        btcmove_subsidy: "-", // BTC transfer and additional issuance of HAC
        burned_fee: "-", // tx fee by burning
        current_circulation: "-", // Current circulation supply
        located_in_channel: "-", // Real time statistics of HAc located in channel chain
    },
    methods:{
        queryDatas: function(){
            var that = this
            apiget("/api/total/supply", {
            }, function(data){
                // console.log(data)
                // console.log(that)
                that.minted_diamond = data.minted_diamond
                that.transferred_bitcoin = data.transferred_bitcoin
                that.miner_reward = data.miner_reward
                that.channel_interest = data.channel_interest
                that.btcmove_subsidy = data.btcmove_subsidy
                that.burned_fee = data.burned_fee
                that.located_in_channel = data.located_in_channel
                that.current_circulation = data.current_circulation
            })
        },

    }
})

// 请求数据
vAppTotalSupply.queryDatas()


///////////////////////////////


var vAppDiamondCreateTxs = new Vue({
    el: '#diamondcreatetxs',
    data: {
        period: 0,
        number: 0,
        txs: null,
    },
    methods:{
        queryDatas: function(){
            var that = this
            apiget("/api/diamond/createtxs", {
            }, function(data){
                // console.log(data)
                that.txs = data.datas
                that.period = data.period
                that.number = data.number
            })
        },

    }
})

// 请求数据
vAppDiamondCreateTxs.queryDatas()




//////////////////////////////////////


var vAppTransfers = new Vue({
    el: '#transfers',
    data: {
        transfers: [],
        refreshTip: "↺Refresh",
        refreshBtn: true,
        showMoreBtn: false,
        page: 1,
        limit: 15,
    },
    methods:{
        queryTransferDatas: function(){
            var that = this
            apiget("/api/transfer/logs", {
                page: that.page,
                limit: that.limit,
            }, function(data){
                that.transfers = that.transfers.concat(data)
                that.page++
                that.showMoreBtn = data.length==that.limit ? true : false
            })
        },
        refresh: function(){
            var that = this
            that.transfers = []
            that.page = 1
            that.refreshBtn = false
            setTimeout(function(){
                that.refreshBtn = true
                that.refreshTip = "Data ok!";
                setTimeout(function(){
                    that.refreshTip = "↺Refresh";
                }, 3000)
                that.queryTransferDatas()
            }, 300)
        },
    }
})

// 请求数据
vAppTransfers.queryTransferDatas()





//////////////////////////////////////////////////////////////////




var vAppOperateActionLogs = new Vue({
    el: '#operateactionlogs',
    data: {
        operateactionlogs: [],
        showMoreBtn: true,
        firstMore: true,
        page: 1,
        limit: 15,
    },
    methods:{
        getDataJumpRoute: function(tystr) {
            if( tystr.indexOf("channel") != -1 ){
                return "channel"
            }else if( tystr.indexOf("user lending") != -1 ){
                return "usrlend"
            }else if( tystr.indexOf("diamond syslend") != -1 ){
                return "dialend"
            }else if( tystr.indexOf("bitcoin syslend") != -1 ){
                return "btclend"
            }else if( tystr.indexOf("bitcoin move") != -1 ){
                return "lockbls"
            }else if( tystr.indexOf("lockbls open") != -1 ){
                return "lockbls"
            }
        },
        queryTransferDatas: function(){
            var that = this
            that.firstMore = false
            apiget("/api/operate/actionlogs", {
                page: that.page,
                limit: that.limit,
            }, function(data){
                that.operateactionlogs = that.operateactionlogs.concat(data)
                that.page++
                that.showMoreBtn = data.length==that.limit ? true : false
            })
        },
    }
})

// 请求数据
vAppOperateActionLogs.queryTransferDatas()



//////////////////////////////////////////////////////////////////




var vAppRanking = new Vue({
    el: '#ranking',
    data: {
        tabn: "",
        dtcaches: {},
        list: null,
    },
    methods:{
        showList: function(name, list){
            var that = this
            that.list = list
        },
        selectTab: function(name){
            // alert(name)
            var that = this
            that.tabn = name
            if(that.dtcaches[name]){
                return that.showList(name, that.dtcaches[name])
            }
            apiget("/api/ranking/top", {
                kind: name,
            }, function(data){
                if(data.list || data.list.length>0){
                    var items = []
                    for(var i in data.list){
                        var one = data.list[i]
                          , li = one.split(" ")
                        // console.log(li)
                        items.push({
                            num: parseInt(i)+1,
                            address: li[0],
                            value: li[1],
                            percent: li[2]
                        })
                    }
                    that.showList(name, items)
                    that.dtcaches[name] = items
                }else{
                    that.showList(name, [])
                    that.dtcaches[name] = []
                }
            })
        },

    }
})

// vAppRanking.selectTab("hacash")







//////////////////////////////////////////////////////////////////



var vAppDfcts = new Vue({
    el: '#dfcts',
    data: {
        target_hashpower: '0 H/s',
        current_hashpower: '0 H/s',
    },
    methods:{
    }
})


var vAppBlocks = new Vue({
    el: '#blocks',
    data: {
        last_height: last_height,
        last_cuttime: 66,
        blocks: [],
        pagelimit: 11,

        showMoreBtn: false,
    },
    methods:{
        updateLastHeight: function(newhei){
            if(newhei > this.last_height){
                // 请求最新的数据
                this.queryNewDatas(newhei, newhei-this.last_height, true)
                this.last_height = newhei
            }
        },
        queryNewDatas: function(last, limit, addfront){
            var that = this
            apiget("/api/block/list", {
                last: last,
                limit: limit,
            }, function(data){
                that.showMoreBtn = true
                if(addfront){
                    that.blocks = data.datas.concat(that.blocks)
                }else{
                    that.blocks = that.blocks.concat(data.datas)
                }
            })
        },
        queryMoreDatas: function(){
            if(this.blocks[0]){
                this.showMoreBtn = false
                var last = this.blocks[this.blocks.length-1].height - 1
                this.queryNewDatas(last, vAppBlocks.pagelimit)
            }
        }
    },
})



// 定时更新 last heigth
setInterval(function(){
    if( vAppBlocks.last_cuttime <= 1 ){
        return
    }
    vAppBlocks.last_cuttime -= 1
    if( vAppBlocks.last_cuttime == 1 ){
        apiget("/api/block/last", {}, function(data){
            vAppBlocks.last_cuttime = 66
            vAppBlocks.updateLastHeight(data.height) // 更新数据
        })
    }
}, 1000)

// 默认加载数据
vAppBlocks.queryNewDatas(last_height, vAppBlocks.pagelimit)




////////////////////////////////////////////////



function drawDifficultyCharts(data){
    // 绘制算力曲线
    //获取Canvas对象(画布)
    var cvs = document.getElementById("dfcts_canvas");
    //简单地检测当前浏览器是否支持Canvas对象，以免在一些不支持html5的浏览器中提示语法错误
    if(cvs.getContext){  
        //获取对应的CanvasRenderingContext2D对象(画笔)
        cvs.width = parseInt(getStyle(cvs, "width"))
        var ctx = cvs.getContext("2d")
        ctx.lineWidth = 1;
        // 坐标轴距离画布上右下左的边距
        var padding = {
            top: 2,
            right: 2,
            bottom: 2,
            left: 2
        }
        // 求坐标轴原点的坐标
        var origin = {
            x: padding.left,
            y: cvs.height - padding.bottom
        }
        // 求坐标轴默认可显示数据的范围
        var coordMaxX = cvs.width - padding.left - padding.right;
        var coordMaxY = cvs.height - padding.top - padding.bottom ;

        // var data = [ 100, 200, 400, 600, 1200, 1800, 1000, 500, 20 ];
 
        // 求数据缩放的比例
        var ratioX = coordMaxX / data.length;
        var ratioY = coordMaxY / Math.max.apply( null, data );
 
        // 根据比例，对元数据进行缩放
        var ratioData = data.map( function( val, index ) {
            return val * ratioY;
        });

        // 画网格
        drawGrid(ctx, '#ccc', 20, 50);
 
        // 画折线
        ctx.beginPath();
        ratioData.forEach( function( val, index ) {
            ctx.lineTo( origin.x + ( index * ratioX), origin.y - val );
        });
        ctx.stroke();

        
        

    }
}

// 加载算力难度值
// apiget("/api/difficulty/charts", {}, function(data){
//     console.log(data)
//     // vAppDfcts.hashpower = data.hashpower
//     drawDifficultyCharts(data.nums)
// })

// // 加载算力难度值
// apiget("/api/difficulty/chartsv2", {}, function(data){
//     console.log(data)
//     // vAppDfcts.hashpower = data.hashpower
//     // historys    days30
//     // var nums = data.historys.concat(data.days30)
//     var nums = data.days30
//     drawDifficultyCharts(nums)
// })

// // 加载算力值
// apiget("/api/difficulty/powpower", {}, function(data){
//     console.log(data)
//     vAppDfcts.target_hashpower = data.target_show
//     vAppDfcts.current_hashpower = data.current_show
// })


// 加载算力难度值
apiget("/api/difficulty/chartsv3", {}, function(data){
    console.log(data)
    vAppDfcts.target_hashpower = data.target_show
    vAppDfcts.current_hashpower = data.current_show
    // vAppDfcts.hashpower = data.hashpower
    // historys    days30
    // var nums = data.historys.concat(data.days30)
    var nums = data.days30
    drawDifficultyCharts(nums)
})

setTimeout(function(){
    // drawDifficultyCharts([9,1,5,8,4,3,5,7,6,4,5])
}, 1000)



// 画网格

function drawGrid(context, color, stepx, stepy) {
    context.save()
    // context.fillStyle = 'white';
    // console.log(context);
    //context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.setLineDash([2,6]);
    context.lineWidth = 0.5;
    context.strokeStyle = color;
    for (var i = stepx; i < context.canvas.width; i += stepx) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, context.canvas.height);
        context.closePath();
        context.stroke();
    }
    for (var j = stepy; j < context.canvas.height; j += stepy) {
        context.beginPath();
        context.moveTo(0, j);
        context.lineTo(context.canvas.width, j);
        context.closePath();
        context.stroke();
    }
    context.restore();
}