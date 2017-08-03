<template>
  <div id="app">
    <div class="container">
          <div class="cart">
            <div class="checkout-title">
              <span>购物车</span>
            </div>

            <!-- table -->
            <div class="item-list-wrap">
              <div class="cart-item">
                <div class="cart-item-head">
                  <ul>
                    <li>商品信息</li>
                    <li>商品金额</li>
                    <li>商品数量</li>
                    <li>总金额</li>
                    <li>编辑</li>
                  </ul>
                </div>
                <ul class="cart-item-list">
                  <li v-for="(item,index) in productList">
                    <div class="cart-tab-1">
                      <div class="cart-item-check">
                        <!-- item是当前数组索引的对象,通过访问item下的属性获取数据的值 -->
                        <a href="javascript:void 0" class="item-check-btn" :class="{'check':item.checked}" @click="selectProduct(item)">
                          <svg class="icon icon-ok"><use xlink:href="#icon-ok"></use></svg>
                        </a>
                      </div>
                      <div class="cart-item-pic">
                        <img v-bind:src="item.productImage" alt="烟">
                      </div>
                      <div class="cart-item-title">
                        <div class="item-name">{{item.productName+"=索引为"+index}}</div>
                      </div>
                      <div class="item-include">
                        <dl>
                          <dt>赠送:</dt>
                          <dd v-for="part in item.parts">{{part.partsName}}</dd>
                        </dl>
                      </div>
                    </div>
                    <div class="cart-tab-2">
                      <div class="item-price">{{item.productPrice | formatMoney}}</div>
                    </div>
                    <div class="cart-tab-3">
                      <div class="item-quantity">
                        <div class="select-self select-self-open">
                          <div class="quantity">
                            <a href="javascript:void 0;" v-on:click="changeMoney(item,-1)">-</a>
                            <input type="text" disabled :style="{ width: 50 + 'px' }" v-model="item.productQuantity">
                            <a href="javascript:void 0;" @click="changeMoney(item,+1)">+</a>
                          </div>
                        </div>
                        <div class="item-stock">有货</div>
                      </div>
                    </div>
                    <div class="cart-tab-4">
                      <div class="item-price-total">{{item.productPrice*item.productQuantity | formatMoney}}</div>
                    </div>
                    <div class="cart-tab-5">
                      <div class="cart-item-operation">
                        <a href="javascript:;" class="item-edit-btn" @click="delConfirm(item)">
                          <span class="icon icon-del"><img src="static/img/del.png"></span>
                        </a>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <!-- footer -->
            <div class="cart-foot-wrap">
              <div class="cart-foot-l">
                <div class="item-all-check">
                  <a href="javascript:void 0">
                    <span class="item-check-btn" :class="{'check':checkAll}" @click="checkAllFlag(true)">
                      <svg class="icon icon-ok"><use xlink:href="#icon-ok"></use></svg>
                    </span>
                    <span>全选</span>
                  </a>
                </div>
                <div class="item-all-del">
                  <a href="javascript:void 0" class="item-del-btn" @click="checkAllFlag(false)">
                    <span>取消全选</span>
                  </a>
                </div>
              </div>
              <div class="cart-foot-r">
                <div class="item-total">
                  Item total: <span class="total-price">{{totalMoney | formatMoney}}</span>
                </div>
                <div class="next-btn-wrap">
                  <a href="address.html" class="btn btn--red" style="width: 200px">结账</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="md-modal modal-msg md-modal-transition" id="showModal" :class="{'md-show':delBtn}">
          <div class="md-modal-inner">
            <div class="md-top">
              <button class="md-close" @click="delBtn=false">关闭</button>
            </div>
            <div class="md-content">
              <div class="confirm-tips">
                <p id="cusLanInfo">你确认删除此订单信息吗?</p>
              </div>
              <div class="btn-wrap col-2">
                <button class="btn btn--m" id="btnModalConfirm" @click="delProduct()">Yes</button>
                <button class="btn btn--m btn--red" id="btnModalCancel" @click="delBtn=false">No</button>
              </div>
            </div>
          </div>
        </div>
        <div class="md-overlay" v-if="delBtn"></div>
  </div>
</template>

<script>
import Vue from 'vue'
import VueResource from 'vue-resource'
Vue.use(VueResource)

export default {
  data: function () {
    return {
      productList:[],
      totalMoney:0,
      productQuantity:1,
      checkAll:false,
      delBtn:false,
      curProduct:''
    }
  },
  filters: {//局部过滤器
    formatMoney: function(value){
      return "¥ "+value.toFixed(2);
    }
  },
  mounted: function(){////默认方法，类似ready
    this.$nextTick(function () {
    // 代码保证 this.$el 在 document 中
      this.createView();
    })
  },
  methods: {
     //绑定数据
    createView:function(){
      var _this=this;//this在vue实例方法里面,所有的this都指向的是vm的实例,但是在某一个函数内部,比如这里的回调函数then,作用域已经发生变化,所以要把this先保存下来,但是用es6语法就不需要这样子做
      this.$http.get('./data/cartData.json',{'id':123}).then(function (res) {//引用vue-resource,有点类似jQuery的ajax,this指向这个实例
        _this.productList = res.body.result.list;//将返回的json数据结果显示在列表里，resource插件会把json数据进行一层封装,因此获取数据的时候要使用res.body
        // _this.totalMoney = res.body.result.totalMoney;
      })
    },
    //点击加减
    changeMoney:function(item,type){
      if(type<0){
        item.productQuantity--;
        if(item.productQuantity<1){
          item.productQuantity = 1;
        }
      }else{
        item.productQuantity++;
      };
      //计算总金额
      this.calcTotalMoney();
    },
    //选择商品
    selectProduct:function(item){//之前漏掉了这个参数一直报错：item is not defined
      if(typeof item.checked == 'undefined'){//判断属性是否为存在
        Vue.set(item,"checked",true);//添加checked属性到item上
        // this.$set(item,"checked",true);//局部注册
      }else{
        item.checked = !item.checked;
      }
      //全部选中则全选点亮，相反
      var checkAllFlags = true;
      this.productList.forEach(function(value,index){
          checkAllFlags = checkAllFlags && value.checked;//与为true则为true，若value.checked为false则checkAll为false
      });
      this.checkAll = checkAllFlags; 
      //计算总金额
      this.calcTotalMoney();
    },
    //全选
    checkAllFlag:function(flag){
      this.checkAll = flag;
      var _this=this;
      this.productList.forEach(function (item,index) {//遍历商品列表
        if(typeof item.checked == 'undefined'){//如果不点击商品按钮直接点全选，就必须先给商品注册选中属性，其值为全选按钮的值
          _this.$set(item,"checked",_this.checkAll);
        }else{//如果已经商品按钮（属性已经注册有）点击过，则直接赋值
          item.checked = _this.checkAll;
        }
      });
      this.calcTotalMoney();
    },
    //计算总金额函数
    calcTotalMoney: function () {
      var _this=this;
      this.totalMoney=0;//每次选中商品时要先将前面计算得数据清零再重算，否则会累加
      this.productList.forEach(function (item,index) {//遍历商品列表，将被选中的商品总价算出同时会显示
        if(item.checked){
          _this.totalMoney += item.productPrice*item.productQuantity;
        }
      });
    },
    //点击删除按钮
    delConfirm: function (item) {
      this.delBtn = true;
      this.curProduct = item;//将当前点击的商品保存起来
    },
    //点击yes按钮
    delProduct: function(){
      var index = this.productList.indexOf(this.curProduct);//获取当前点击item的下标
      this.productList.splice(index,1);//删除
      this.delBtn = false;//隐藏弹出层
    }
  }
}
// //全局过滤器
// Vue.filter(function(value,type) {
//   return "¥"+value.toFixed(2) + type;
// });
</script>

<style>
@import '/static/css/modal.css';
@import '/static/css/base.css';
@import '/static/css/checkout.css';
.quentity input {
    width: 40px;
    padding: 5px 10px;
    text-align: center;
}
</style>
