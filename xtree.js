/* Copyright reserved by Xu Liu and it is free to use
 * Author: Xu Liu
 * Email: kkliuxu@gmail.com
 * Location: Toronto, Canada
 * 
*  xtree method:
*  1) initialize the xtreeNode. there are two ways. new xtreeNode("node title", selected or not, <unique id>)
*     1.1) without node id -> new xtreeNode("Sports", false);
*     1.2) with node id -> new xtreeNode("Sports", false, "uniqueId"); 
*  2) load data and add nodes:
	var request = {url:"http://www.google.com",method:"GET",data:null,header:null};
	tree.loadNodes(request,function(data,success){
		var nodes = new Array();
		nodes[0] = new xtreeNode("Sports", false);
		nodes[1] = new xtreeNode("Food", true);
		nodes[2] = new xtreeNode("Travel", false);
		tree.addNodesForNode(null,nodes);
	});
   3) listen the node click event, it is different from selected. this just show the node is clicked
   	tree.didClickedNode = function(node,expanded){
		if(expanded){alert('expanded' + node.htmlTitle);}
		else{alert('collapsed' + node.htmlTitle);}
	};
   4) listen the node is selected or not, it is different from click.
   	tree.didSelectedNode = function(node, checked){
		if(checked){alert('checked' + node.htmlTitle);}
		else{alert('no-checked' + node.htmlTitle);}
	};
   5) get all selected xtreeNode
    for(var index in tree.cachedSelectedNodes){
    		alert(tree.cachedSelectedNodes[index]);
    }
   6) if a node is loading the, we can change the icon state. there are 3 states for the node (EXPANDED,COLLAPSED,BUSY,LEAF)
      when loading data and try to prepare the nodes, we can call BUSY. and after the data come back, then call EXPANDED or COLLAPSED to restore the state
      LEAF is the last node of the tree.
   	tree.didClickedNode = function(node,expanding){
		if(expanding){
			alert('expanding' + node.htmlTitle);
			tree.changeNodeIconState(node, XTREE_NODE_STATE.BUSY);
		}
		else{alert('collapsing' + node.htmlTitle);}
	};
	7) hide and show children nodes from parent nodes
	tree.hideChildNodesFromParentNode(parentNodeId);
	tree.showChildNodesFromParentNode(parentNodeId);
	8) hide and remove children nodes from parent nodes, 
	   so that we can update the children nodes by calling tree.addNodesForNode to refresh
	   this method will update the cachedSelectedNodes storage while the hide and show won't update the cachedSelectedNodes
	tree.hideAndRemoveChildNodesFromParentNode(parentNodeId);
	9) check a parent node has child nodes or not
	tree.isChildNodesExisted(parentNodeId);
	10) delete a current node
	function deleteTouchedNode(){
		var node = xtree.currentTouchedNode;
		if(node.nodeId != null){//there is a touched node
			if(confirm("do you want to remove '"+  node.htmlTitle +"'")){
				tree.removeCurrentNodeByNodeId(node.nodeId, function(){
					alert('successfully delete current touched node:' + node.htmlTitle);
				});
			}
		}
	}
	11) update a current node htmlTitle
	function updateTouchedNode(){
		var node = xtree.currentTouchedNode;
		if(node.nodeId != null){//there is a touched node
			tree.updateHTMLTitleForNode(node.nodeId, "Update Node");
		}
	}
	12) add a node as a child to a current node
	function createChildNode(){
		var node = xtree.currentTouchedNode;
		if(node.nodeId != null){//there is a touched node
			var nodes = new Array();
			nodes[0] = new xtreeNode("New Node", false);
			tree.addNodesForNode(node.nodeId,nodes);
		}
	}
	13) get all selected node
		13.1) first call the function to fetch: tree.captureSelectedState();
		13.2) then use it in the array (return xtreeNode array): var selectedNode = tree.cachedSelectedNodes
	14) select all direct parents based on a current id
		tree.didSelectedNode = function(node, checked){
			if(checked){
				tree.setAllParentNodesState(node.nodeId, checked);
			}
			else{
				tree.setAllParentNodesState(node.nodeId, checked);
			}
		};
	15) select all direct child based on a current id
		tree.didSelectedNode = function(node, checked){
			if(checked){
				tree.setAllChildNodesState(node.nodeId, checked);
			}
			else{
				tree.setAllChildNodesState(node.nodeId, checked);
			}
		};
*/

//xtree request object
var xtreeRequest = function(url, method, data, header){
	this.url= url;
	this.method = method;
	if(this.method.length<= 0){this.method="GET";}
	this.data = data;
	this.header = header
};

//xtree node object
var xtreeNode = function(htmlTitle, selected, nodeId){
	xtree.elementCount++;
	if(nodeId === undefined){
		this.nodeId = "node" + new Date().getTime() + xtree.elementCount;
	}else{
		this.nodeId = nodeId;
	}
	this.htmlTitle = htmlTitle;
	this.selected = selected;
	
	//dump nodes information
	this.dumpNode = function(){
		return "htmlTitle:"+ this.htmlTitle +",selected:"+ (selected?"Yes":"No") +",nodeId:" + nodeId;
	}
};

//xtree node state
var XTREE_NODE_STATE = {EXPANDED:0, COLLAPSED:1, BUSY:2, LEAF:3};

//initialize the tree object for using.
var xtree = function(){
	//automatically set up the xtree id
	this.id = "xtree" + new Date().getTime();
	//register object to dom
	$("body").data(this.id, this);
	//save all selected xtreeNode
	this.cachedSelectedNodes = new Array();
	//element count
	xtree.elementCount = 0;
	//previous touched node
	xtree.currentTouchedNode = null;
	
	//those are call back function as below
	this.didClickedNode = null;
	this.didSelectedNode = null;
	
	//compose the loadNodes method for quick use
	this.loadNodes = function(request, callback){
		$.ajax({
			  url:request.url,
			  datatype:'json',
			  data:request.data,
			  headers:request.header,
			  type:request.method,
			  success: function(data){
				  callback(data, true);
			  },
			  error:function(jqXHR, status, error){
				  callback(error, false);
			  }
			});	
	};//loadNodes function
	
	//generate list based on a given xtree node
	//if add the nodes for the root level, don't need to specify the parentNodeId
	this.addNodesForNode = function (parentNodeId, nodes){
		var nodesHTML = "";
		var newHolder = "";
		var parentPanelExisted = false;
		if(parentNodeId == null){ 
			//decide to append a panel or just add a new entry
			if($("#pr_firstLevelRoot").length<=0){nodesHTML = "<ul id='pr_firstLevelRoot' class=\"xtree_root\">";}
			else{
				parentPanelExisted = true;
			}
		}else{
			if($("#pr_"+ parentNodeId).length<=0){
				nodesHTML = "<ul id='pr_"+ parentNodeId +"' class=\"xtree_child\" style='display:none;'>";
			}else{
				parentPanelExisted = true;
			}
			newHolder = 'pr_'+ parentNodeId;
		}
		
		for(var i in nodes){
			var node = nodes[i];
			nodesHTML += "<li id='li_"+node.nodeId+"'><input id='ck_"+ node.nodeId +"' type='checkbox' onchange=\"$('body').data('"+this.id+"').chosenNode(this)\" "+ (node.selected?"checked":"") +"/><span id='sp_"+ node.nodeId +"' class=\"xtree_symbol xtree_collapsed\" onclick=\"$('body').data('"+ this.id +"').touchedNode(this)\"></span><span id='lbl_"+ node.nodeId  +"' onclick=\"$('body').data('"+ this.id +"').touchedNode(this)\" style='cursor:pointer;'>" + node.htmlTitle +"</span>";
		}
		if(!parentPanelExisted){
			nodesHTML += "</ul>";
		}
		
		var parentObj = $(".xtree");
		if(!parentPanelExisted){
			//the one is not existed, need to build the whole new panel
			if(parentNodeId != null){
				parentObj = $("#li_" + parentNodeId);	
			}
		}else{
			//panel holder existed, just need to add to the parent panel
			if(parentNodeId != null){
				parentObj = $("#pr_" + parentNodeId);	
			}else{
				parentObj = $("#pr_firstLevelRoot");
			}
		}
		
		parentObj.append(nodesHTML);
		if(newHolder != ""){
			$("#" + newHolder).show("fast");	
		}
	};//addNodesForNode function
	
	//private function to set the touched node
	this.touchedNode = function(touchedNode){
		//based on node id and construcut the node object;
		var nodeId = touchedNode.id.substring(touchedNode.id.indexOf("_") + 1);
		if(xtree.currentTouchedNode != null){
			var touchedId = xtree.currentTouchedNode.nodeId;
			$("#lbl_" + touchedId).removeClass("xtree_bold");
		}
		var retNode = new xtreeNode($("#lbl_" + nodeId).html(), $('#ck_' + nodeId).prop('checked'), nodeId);
		xtree.currentTouchedNode = retNode;
		$("#lbl_" + retNode.nodeId).removeClass("xtree_bold");
		$("#lbl_" + retNode.nodeId).addClass("xtree_bold");
		var expanding = $("#sp_" + nodeId).hasClass("xtree_collapsed");
		if(expanding){
			$("#sp_" + nodeId).removeClass("xtree_collapsed");
			$("#sp_" + nodeId).addClass("xtree_expanded");
		}
		else{
			$("#sp_" + nodeId).removeClass("xtree_expanded");
			$("#sp_" + nodeId).addClass("xtree_collapsed");
		}
		this.didClickedNode(retNode, expanding);
	}
	
	//private function to set the selected node
	this.chosenNode = function(selectedNode){
		var nodeId = selectedNode.id.substring(selectedNode.id.indexOf("_") + 1);
		var retNode = new xtreeNode($("#lbl_" + nodeId).html(), $('#ck_' + nodeId).prop('checked'), nodeId);
		if($('#ck_' + nodeId).prop('checked')){//if checked, record it and put it into array.
			this.addSelectedNodeFromCache(retNode);
		}else{	//remove unchecked node if necessary
			this.removeSelectedNodeFromCache(retNode);
		}
		//need to manage the check or null check array.
		this.didSelectedNode(retNode, $('#ck_' + nodeId).prop('checked'));
	}
	
	//private function remove selected node from cache 
	this.removeSelectedNodeFromCache = function(unselectedNode){
		for(var index in this.cachedSelectedNodes){
			var node = this.cachedSelectedNodes[index];
			if(node.nodeId == unselectedNode.nodeId){
				this.cachedSelectedNodes.splice(index,1);
			}
		}
	}
	
	//public get tree node by node id, if the node can not be find, the return is null
	this.getXTreeNodeByNodeId = function(nodeId){
		var retNode = null;
		//check if node is existing
		if($("#li_"+ nodeId).length != 0){
			retNode = new xtreeNode($("#lbl_" + nodeId).html(), $('#ck_' + nodeId).prop('checked'), nodeId);
		}
		return retNode;
	}
	
	//private function add selected nodes, this function will check the duplicated nodeId
	this.addSelectedNodeFromCache = function(selectedNode){
		var existed = false;
		for(var index in this.cachedSelectedNodes){
			var node = this.cachedSelectedNodes[index];
			if(node.nodeId == selectedNode.nodeId){
				existed = true;
				break;
			}
		}
		if(!existed){
			this.cachedSelectedNodes.push(selectedNode);
		}
	}
	
	//can used to change a state of a icon in front of the node
	this.changeNodeIconState = function(node, nodeState){
		$("#sp_" + node.nodeId).removeClass("xtree_collapsed");
		$("#sp_" + node.nodeId).removeClass("xtree_expanded");
		$("#sp_" + node.nodeId).removeClass("xtree_throbber");
		$("#sp_" + node.nodeId).removeClass("xtree_leaf");
		if(nodeState == XTREE_NODE_STATE.EXPANDED){
			$("#sp_" + node.nodeId).addClass("xtree_expanded");
		}else if(nodeState == XTREE_NODE_STATE.COLLAPSED){
			$("#sp_" + node.nodeId).addClass("xtree_collapsed");
		}else if(nodeState == XTREE_NODE_STATE.BUSY){
			$("#sp_" + node.nodeId).addClass("xtree_throbber");
		}else if(nodeState == XTREE_NODE_STATE.LEAF){
			$("#sp_" + node.nodeId).addClass("xtree_leaf");
		}else{
			$("#sp_" + node.nodeId).addClass("xtree_expanded");
		}
	}
	
	//hide a group of subitems
	//operation for a group of child nodes
	this.hideChildNodesFromParentNode = function(parentNodeId){
		$("#pr_" + parentNodeId).hide("fast");
	}
	this.showChildNodesFromParentNode = function(parentNodeId){
		$("#pr_" + parentNodeId).show("fast");
	}
	
	//public delete a node's child and child's child nodes recursively. callback pass nothing. just indicate
	// the hide and remove feature is finisehd
	this.hideAndRemoveChildNodesFromParentNode = function(parentNodeId, callback){
		var treeIdentifier = this.id;
		if($("#pr_" + parentNodeId).length > 0){
			$("#pr_" + parentNodeId).hide("fast",function(){
				//search all subnode id and remove them from cachedSelectedNode.
				var childNodes = $("#pr_" + parentNodeId).find("li");
				for(var i = 0; i < childNodes.length; i++){
					var elementId = childNodes[i].id;
					if(elementId.length > 0){
						var childNodeId = elementId.substring(elementId.indexOf("_") + 1);
						var node = $("body").data(treeIdentifier).getXTreeNodeByNodeId(childNodeId);
						if(node != null){
							//remove child's child
							$("body").data(treeIdentifier).hideAndRemoveChildNodesFromParentNode(node.nodeId, function(){
								$("body").data(treeIdentifier).removeSelectedNodeFromCache(node);
							});
						}
					}//elementId larger than zero
				}//for childNodes.length
				//after remove the selected cache nodes, then remove the holder
				$("#pr_" + parentNodeId).remove();
				callback();
			});
		}else{
			callback();
		}
	}//this.hideAndRemoveChildNodesFromParentNode
	
	//public remove current nodes and child node, callback return nothing, just indicated the remove is finisehd
	this.removeCurrentNodeByNodeId = function(nodeId, callback){
		var treeIdentifier = this.id;
		if($("#pr_" + nodeId).length > 0){
			$("#pr_" + nodeId).hide("fast",function(){
				//search all subnode id and remove them from cachedSelectedNode.
				var childNodes = $("#pr_" + nodeId).find("li");
				for(var i = 0; i < childNodes.length; i++){
					var elementId = childNodes[i].id;
					if(elementId.length > 0){
						var childNodeId = elementId.substring(elementId.indexOf("_") + 1);
						var node = $("body").data(treeIdentifier).getXTreeNodeByNodeId(childNodeId);
						if(node != null){
							//remove child's child
							$("body").data(treeIdentifier).hideAndRemoveChildNodesFromParentNode(node.nodeId, function(){
								$("body").data(treeIdentifier).removeSelectedNodeFromCache(node);
							});
						}
					}//elementId larger than zero
				}//for childNodes.length
				//after remove the selected cache nodes, then remove the holder
				$("#pr_" + nodeId).remove();
				$("#li_" + nodeId).remove();
				callback();
			});
		}else{
			$("#li_" + nodeId).remove();
			callback();
		}
	}
	
	//public update info for a node
	this.updateHTMLTitleForNode = function(nodeId, htmlTitle){
		if($("#lbl_" + nodeId).length > 0){
			$("#lbl_" + nodeId).html(htmlTitle);
		}
	}
	
	//public change selected state to all parent nodes
	this.setAllParentNodesState = function(nodeId, selectedState){
		var parentsNodes = $("#li_" + nodeId).parents("li");
		for(var i = 0; i < parentsNodes.length; i++){
			var elementId = parentsNodes[i].id;
			if(elementId.length > 0){
				var parentNodeId = elementId.substring(elementId.indexOf("_") + 1);
				if($("#ck_" + parentNodeId).length > 0){
					$("#ck_" + parentNodeId).prop("checked",selectedState);
				}
			}//elementId larger than zero
		}
	}
	
	//public capture and go through all the elements and check the state
	this.captureSelectedState = function(){
		var allElements = $(".xtree").find("li");
		this.cachedSelectedNodes = [];
		for(var i = 0; i < allElements.length; i++){
			var elementId = allElements[i].id;
			if(elementId.length > 0){
				var childNodeId = elementId.substring(elementId.indexOf("_") + 1);
				if($("#ck_" + childNodeId).length > 0){
					if($("#ck_" + childNodeId).prop('checked')){
						var retNode = new xtreeNode($("#lbl_" + childNodeId).html(), $('#ck_' + childNodeId).prop('checked'), childNodeId);
						this.cachedSelectedNodes.push(retNode);
					}
				}//check state
			}//elementId larger than zero
		}
	}
	
	//public change selected state to all child nodes
	this.setAllChildNodesState = function(nodeId, selectedState){
		if($("#pr_" + nodeId).length > 0){
			var childNodes = $("#pr_" + nodeId).find("li");
			for(var i = 0; i < childNodes.length; i++){
				var elementId = childNodes[i].id;
				if(elementId.length > 0){
					var childNodeId = elementId.substring(elementId.indexOf("_") + 1);
					if($("#ck_" + childNodeId).length > 0){
						$("#ck_" + childNodeId).prop("checked",selectedState);
					}
				}//elementId larger than zero
			}
		}//.length > 0
	}//set all child nodes state
	
	
	//check a parent node has child nodes or not
	this.isChildNodesExisted = function(parentNodeId){
		//check whether a parentNodeId has childNodes
		return ($("#pr_" + parentNodeId).length != 0);
	}
	
	
};//var xtree = function
			
			