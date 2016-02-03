# XTree - A Javascript Component to Manage Directory Tree Strcuture

XTree is an easy to use component for web developer to manage the directory tree structure.

Download the zip file and include xtree.js and xtree.css, then everything should work. no extra library is required.

<strong>Example 1:</strong> Select all child nodes, create and delete.<br/>
<img src='http://www.xuliu.info/xtree/xtree.gif' />

<strong>Example 2:</strong> Select all parent nodes, create, delete and update.<br/>
<img src='http://www.xuliu.info/xtree/xtree_p.gif' />

XTree Build Method for Developer to use:

   <strong>1) initialize the xtreeNode</strong>. 
	   <br/>there are two ways.<code> new xtreeNode("node title", selected or not, <unique id>) </code>
       <br/>1.1) without node id -> <code> new xtreeNode("Sports", false); </code>
       <br/>1.2) with node id -> <code>new xtreeNode("Sports", false, "uniqueId"); </code>

   <strong>2) load data and add nodes:</strong><br/>
		<code>var request = {url:"http://www.google.com",method:"GET",data:null,header:null};</code><br/>
		<code>  tree.loadNodes(request,function(data,success){</code><br/>
		<code>	var nodes = new Array();</code><br/>
		<code>	nodes[0] = new xtreeNode("Sports", false);</code><br/>
		<code>	nodes[1] = new xtreeNode("Food", true);</code><br/>
		<code>	nodes[2] = new xtreeNode("Travel", false);</code><br/>
		<code>	tree.addNodesForNode(null,nodes);</code><br/>
		<code>});</code><br/>
	
   <strong>3) listen the node click event</strong><br/>
    it is different from selected. this just show the node is clicked<br/>
   	<code>tree.didClickedNode = function(node,expanded){</code><br/>
	<code>	if(expanded){alert('expanded' + node.htmlTitle);}</code><br/>
	<code>	else{alert('collapsed' + node.htmlTitle);}</code><br/>
	<code>};</code><br/>
	
   <strong>4) listen the node is selected or not</strong><br/>
    it is different from click.<br/>
   	<code>tree.didSelectedNode = function(node, checked){</code><br/>
	<code>	if(checked){alert('checked' + node.htmlTitle);}</code><br/>
	<code>	else{alert('no-checked' + node.htmlTitle);}</code><br/>
	<code>};</code><br/>
	
   <strong>5) get all selected xtreeNode</strong><br/>
    <code>for(var index in tree.cachedSelectedNodes){</code><br/>
    		<code>alert(tree.cachedSelectedNodes[index]);</code><br/>
    <code>}</code><br/>
    
   <strong>6) if a node is loading the, we can change the icon state.</strong><br/>
    there are 3 states for the node (EXPANDED,COLLAPSED,BUSY,LEAF) when loading data and try to prepare the nodes, we can call BUSY. and after the data come back, then call EXPANDED or COLLAPSED to restore the state
      LEAF is the last node of the tree.<br/>
   	<code>tree.didClickedNode = function(node,expanding){</code><br/>
		<code>if(expanding){</code><br/>
			<code>alert('expanding' + node.htmlTitle);</code><br/>
			<code>tree.changeNodeIconState(node, XTREE_NODE_STATE.BUSY);</code><br/>
		<code>}</code><br/>
		<code>else{alert('collapsing' + node.htmlTitle);}</code><br/>
	<code>};</code><br/>
		<strong>7) hide and show children nodes from parent nodes</strong><br/>
	<code>tree.hideChildNodesFromParentNode(parentNodeId);</code><br/>
	<code>tree.showChildNodesFromParentNode(parentNodeId);</code><br/>
	<strong>8) hide and remove children nodes from parent nodes</strong><br/> 
	   so that we can update the children nodes by calling tree.addNodesForNode to refresh
	   this method will update the cachedSelectedNodes storage while the hide and show won't update the cachedSelectedNodes<br/>
	<code>tree.hideAndRemoveChildNodesFromParentNode(parentNodeId);</code><br/>
	<strong>9) check a parent node has child nodes or not</strong><br/>
	<code>tree.isChildNodesExisted(parentNodeId);</code><br/>
	<strong>10) delete a current node</strong><br/>
	<code>function deleteTouchedNode(){</code><br/>
		<code>var node = xtree.currentTouchedNode;</code><br/>
		<code>if(node.nodeId != null){//there is a touched node</code><br/>
			<code>if(confirm("do you want to remove '"+  node.htmlTitle +"'")){</code><br/>
				<code>tree.removeCurrentNodeByNodeId(node.nodeId, function(){</code><br/>
					<code>alert('successfully delete current touched node:' + node.htmlTitle);</code><br/>
				<code>});</code><br/>
			<code>}</code><br/>
		<code>}</code><br/>
	<code>}</code><br/>
	<strong>11) update a current node htmlTitle</strong><br/>
	<code>function updateTouchedNode(){</code><br/>
		<code>var node = xtree.currentTouchedNode;</code><br/>
		<code>if(node.nodeId != null){//there is a touched node</code><br/>
			<code>tree.updateHTMLTitleForNode(node.nodeId, "Update Node");</code><br/>
		<code>}</code><br/>
	<code>}</code><br/>
	<strong>12) add a node as a child to a current node</strong><br/>
	<code>function createChildNode(){</code><br/>
		<code>var node = xtree.currentTouchedNode;</code><br/>
		<code>if(node.nodeId != null){//there is a touched node</code><br/>
			<code>var nodes = new Array();</code><br/>
			<code>nodes[0] = new xtreeNode("New Node", false);</code><br/>
			<code>tree.addNodesForNode(node.nodeId,nodes);</code><br/>
		<code>}</code><br/>
	<code>}</code><br/>
	<strong>13) get all selected node</strong><br/>
		13.1) first call the function to fetch: <code>tree.captureSelectedState();</code><br/>
		13.2) then use it in the array (return xtreeNode array): <code>var selectedNode = tree.cachedSelectedNodes</code><br/>
	<strong>14) select all direct parents based on a current id</strong><br/>
		<code>tree.didSelectedNode = function(node, checked){</code><br/>
			<code>if(checked){</code><br/>
				<code>tree.setAllParentNodesState(node.nodeId, checked);</code><br/>
			<code>}</code><br/>
			<code>else{</code><br/>
				<code>tree.setAllParentNodesState(node.nodeId, checked);</code><br/>
			<code>}</code><br/>
		<code>};</code><br/>
	<strong>15) select all direct child based on a current id</strong><br/>
		<code>tree.didSelectedNode = function(node, checked){</code><br/>
			<code>if(checked){</code><br/>
				<code>tree.setAllChildNodesState(node.nodeId, checked);</code><br/>
			<code>}</code><br/>
			<code>else{</code><br/>
				<code>tree.setAllChildNodesState(node.nodeId, checked);</code><br/>
			<code>}</code><br/>
		<code>};</code><br/>
		<strong>16) set all checkbox visible or invisible</strong><br/>
	<code>tree.setVisibleForAllCheckbox(false);</code>
	
