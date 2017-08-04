new Vue({
	el:'.container',
	data:{
		addressList:[],
		showNum:3,
		curProductIndex:0,
		curItem:'',
		isShow:false,
		selectMethod: 1,//配送方式选择
		isModAddress:false,
		modName:'',
		modStreetAddress:'',
		modTel:'',
		modAddId:''
	},
	computed:{//computed是主要对数据进行实时操作，比如删除，插入等。 而filters主要是格式化数据
	  filterAddress:function(){
	    return this.addressList.slice(0,this.showNum);//对addressList返回的数据进行过滤后再输出全新的数组
	  }
	},
	mounted:function(){
		this.$nextTick(function(){
			this.getAddressList();
		});
	},
	methods:{
		//提取数据
		getAddressList:function(){
			this.$http.get('data/address.json').then(res=>{
				this.addressList = res.data.result;
			});
		},
		//设置默认地址
		setDefault:function(addressId){//因为addressId是唯一的
			this.addressList.forEach((address,index)=>{//遍历到相同卡片则设为默认
				if(address.addressId == addressId){//如果addressList里的ID等于当前item的ID
					address.isDefault = true;//一样,将当前卡片状态渲染为默认地址(v-if)
				}else{
					address.isDefault = false;//否则，将卡片状态渲染为设为默认
				}
			});
		},
		//点击删除
		delBtn:function(item){
			this.isShow = true;//显示弹出层
			this.curItem = item;//将当前点击的商品保存到curItem
		},
		//确认删除
		sureDel:function(){
			var index = this.addressList.indexOf(this.curItem);//获取当前点击item的下标
			this.addressList.splice(index,1);
			this.isShow = false;
		},
		//点击修改地址
		modAddress:function(item){//显示弹出层并将获取到的信息保存
			this.isModAddress = true;
			this.modAddId = item.addressId;
			this.modName = item.userName;
			this.modStreetAddress = item.streetName;
			this.modTel = item.tel;
		},
		//确认修改地址
		sureModAdd:function(addressId){
			this.isModAddress = false;
			this.addressList.forEach((item,index)=>{//遍历addressList
				if(item.addressId == addressId){//如果是相同item，将修改后的数据插入显示列表dl
					item.userName = this.modName;
					item.streetName = this.modStreetAddress;
					item.tel = this.modTel;
				}
			});
		}
	}
});
