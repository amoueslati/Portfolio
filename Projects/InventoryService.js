(function (app) {
    app.service('InventoryService', function ($q, eXProcService) {
        var childctx = SP.ClientContext.get_current(); //gets the current context
        var ctx = new SP.ClientContext(childctx.get_url().split("/Inventory")[0]);
        var web = ctx.get_web(); //gets the web object
        var lists = web.get_lists(); //gets the collection of lists
        var inventoryList = lists.getByTitle("Inventory");
        this.getUserProperties = function () {

            var d = $q.defer();
            var peopleManager = new SP.UserProfiles.PeopleManager(ctx);
            var userProfileProperties = peopleManager.getMyProperties();

            ctx.load(userProfileProperties);
            ctx.executeQueryAsync(
                Function.createDelegate(this, function () {

                    var propertyValues = userProfileProperties.get_userProfileProperties();
                    propertyValues.IsBranchUser = (propertyValues.IsBranchUser === 'True');
                    propertyValues.IsAreaManager = (propertyValues.IsAreaManager === 'True');
                    propertyValues.IsRegionalManager = (propertyValues.IsRegionalManager === 'True');
                    propertyValues.BranchCode = propertyValues.IsBranchUser ? propertyValues.BranchCode : null;
                    propertyValues.AreaCode = !isNaN(propertyValues.AreaCode) ? parseInt(propertyValues.AreaCode) : null;
                    propertyValues.RegionCode = !isNaN(propertyValues.RegionCode) ? parseInt(propertyValues.RegionCode) : null;
                    d.resolve(propertyValues);
                }),
                Function.createDelegate(this, function (sender, args) {
                    d.reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                })
            );
            return d.promise;
        }
        this.getStores = function (branch) {

            return eXProcService.executeProcedure('AF4BA2F0-D3FE-42D6-AD1C-C76BFF40954A', [
                { Name: 'inBranchNo', Value: branch }
            ], [
                "Branch", "BranchName", "Area", "Region", "CompanyCode", "Concessions", "BranchRef1"
            ], true);
        };

        this.getProducts = function ()
        {
            var d = $q.defer();
            var productsList = lists.getByTitle("Products"); 
            var camlQuery = new SP.CamlQuery(); 
            camlQuery.set_viewXml(
                '<View><Query></Query></View>'
            );
            productItems = productsList.getItems(camlQuery);
            ctx.load(productItems);
            ctx.executeQueryAsync(
                Function.createDelegate(this, function () {
                    var productsEnum = productItems.getEnumerator();
                    var ProductsArray = [];                 
                    while (productsEnum.moveNext()) {

                        var item = productsEnum.get_current();
                        ProductsArray.push(item);
                    }
                    d.resolve(ProductsArray);
                }),
                Function.createDelegate(this, function (sender, args) {
                    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                })
            );
            return d.promise;
           
        }

        this.getSizes = function () {
            var d = $q.defer();           
            var sizesList = lists.getByTitle("ProductSizes"); 
            var camlQuery = new SP.CamlQuery(); 
            camlQuery.set_viewXml(
                '<View><Query></Query></View>'
            );
            items = sizesList.getItems(camlQuery);
            ctx.load(items);
            ctx.executeQueryAsync(
                Function.createDelegate(this, function () {
                    var enumerator = items.getEnumerator();
                    var SizesArray = [];
                    while (enumerator.moveNext()) {
                        var item = enumerator.get_current();                     
                        SizesArray.push(item);
                    }
                    d.resolve(SizesArray);
                }),
                Function.createDelegate(this, function (sender, args) {
                    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                })
            );
            return d.promise;

        }

        this.getFloors = function () {
            var d = $q.defer();         
            var floorsList = lists.getByTitle("Floors"); 
            var camlQuery = new SP.CamlQuery(); 
            camlQuery.set_viewXml(
                '<View><Query></Query></View>'
            );
            floorItems = floorsList.getItems(camlQuery);
            ctx.load(floorItems);
            ctx.executeQueryAsync(
                Function.createDelegate(this, function () {
                    var floorsEnum = floorItems.getEnumerator();
                    var floorsArray = [];
                    while (floorsEnum.moveNext()) {
                        var floorItem = floorsEnum.get_current();                       
                        floorsArray.push(floorItem);
                    }
                    d.resolve(floorsArray);
                }),
                Function.createDelegate(this, function (sender, args) {
                    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                })
            );
            return d.promise;

        }

        this.getZones = function () {
            var d = $q.defer();
            var zonesList = lists.getByTitle("Zones"); 
            var camlQuery = new SP.CamlQuery(); 
            camlQuery.set_viewXml(
                '<View><Query></Query></View>'
            );
            zoneItems = zonesList.getItems(camlQuery);
            ctx.load(zoneItems);
            ctx.executeQueryAsync(
                Function.createDelegate(this, function () {
                    var zonesEnum = zoneItems.getEnumerator();
                    var zonesArray = [];
                    while (zonesEnum.moveNext()) {
                        var zoneItem = zonesEnum.get_current();
                        zonesArray.push(zoneItem);
                    }
                    d.resolve(zonesArray);
                }),
                Function.createDelegate(this, function (sender, args) {
                    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                })
            );
            return d.promise;
        }

        this.getInventory = function (branchNumber) {
            var d = $q.defer();
            var camlQuery = new SP.CamlQuery(); 
            camlQuery.set_viewXml(
                '<View><Query><Where><Eq><FieldRef Name="Branch" /><Value Type="Number">' + branchNumber + '</Value></Eq></Where></Query></View>'
            );

            inventoryItems = inventoryList.getItems(camlQuery);
            ctx.load(inventoryItems);
            ctx.executeQueryAsync(
                Function.createDelegate(this, function () {
                    var inventoryEnum = inventoryItems.getEnumerator();
                    var inventoryArray = [];
                    while (inventoryEnum.moveNext()) {
                        var inventoryItem = inventoryEnum.get_current();                        
                        inventoryArray.push(inventoryItem);
                    }
                    d.resolve(inventoryArray);
                }),
                Function.createDelegate(this, function (sender, args) {
                    d.reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                })
            );
            return d.promise;

        }

        this.CreateInventoryItems = function (products)
        {
            var d = $q.defer();
            var newItems = [];
            var ProductValue = new SP.FieldLookupValue();
            var SizeValue = new SP.FieldLookupValue();
            var FloorValue = new SP.FieldLookupValue();
            var ZoneValue = new SP.FieldLookupValue();
            angular.forEach(products, function (product) {                   
                var item = inventoryList.addItem(new SP.ListItemCreationInformation());
                    ProductValue.set_lookupId(product.ProductId);
                    SizeValue.set_lookupId(product.SizeId);
                    FloorValue.set_lookupId(product.FloorId);
                    ZoneValue.set_lookupId(product.ZoneId);
                    item.set_item('Title', "Inventory");
                    item.set_item('Region', product.Region);
                    item.set_item('Area', product.Area);
                    item.set_item('Branch', product.Branch);
                    item.set_item('BranchName', product.BranchName);
                    item.set_item('Product', ProductValue);
                    item.set_item('Size', SizeValue);
                    item.set_item('Floor', FloorValue);
                    item.set_item('Zone', ZoneValue);
                    item.set_item('Qty', product.Qty);
                    item.update();
            });
            ctx.executeQueryAsync(
                Function.createDelegate(this, function () {
                    d.resolve();
                },
                Function.createDelegate(this, function (sender, args) {
                    d.reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                })
                ));

            return d.promise;
        }

        this.UpdateInventory = function (inventory) {
            var d = $q.defer();
            var newItems = [];            
            var ProductValue = new SP.FieldLookupValue();
            var SizeValue = new SP.FieldLookupValue();
            var FloorValue = new SP.FieldLookupValue();
            var ZoneValue = new SP.FieldLookupValue();
            angular.forEach(inventory, function (product) {
               // item = list.getItems(camlQuery);
                var item = inventoryList.getItemById(product.ID);
                ctx.load(item);
                ProductValue.set_lookupId(product.ProductId);
                SizeValue.set_lookupId( product.SizeId);
                FloorValue.set_lookupId( product.FloorId);
                ZoneValue.set_lookupId(product.ZoneId);
                item.set_item('Title', "Test");
                item.set_item('Region', product.Region);
                item.set_item('Area', product.Area);
                item.set_item('Branch', product.Branch);
                item.set_item('BranchName', product.BranchName);
                item.set_item('Product', ProductValue);
                item.set_item('Size', SizeValue);
                item.set_item('Floor', FloorValue);
                item.set_item('Zone', ZoneValue);
                item.set_item('Qty', product.Qty);
                item.update();
                        
            });
      
            ctx.executeQueryAsync(
                Function.createDelegate(this, function () {
                    d.resolve();
                },
                Function.createDelegate(this, function (sender, args) {
                    d.reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());})
                ));
           
            return d.promise;
        }

        this.DeleteInventory = function (inventory)
        {
            var d = $q.defer();
            angular.forEach(inventory, function (product) {                   
                var item = inventoryList.getItemById(product.ID);
                    ctx.load(item);
                    item.deleteObject();
                    inventoryList.update();
            });
            ctx.executeQueryAsync(
                Function.createDelegate(this, function () {
                    d.resolve();
                },
                Function.createDelegate(this, function (sender, args) {
                    d.reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                })
            ));
            return d.promise;
        }              
    });
}(angular.module('Inventory')));