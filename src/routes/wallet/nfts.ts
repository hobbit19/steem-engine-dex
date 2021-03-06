import { NftPropertiesModal } from './../../modals/nft/nft-properties';
import { DialogService } from 'aurelia-dialog';
import { State } from 'store/state';
import { connectTo, dispatchify } from 'aurelia-store';
import { SteemEngine } from 'services/steem-engine';
import { autoinject } from 'aurelia-framework';
import { getUserNfts } from 'store/actions';

@autoinject()
@connectTo()
export class MyNfts {
    private state: State;
    private loading = false;
    
    constructor(private se: SteemEngine, private dialogService: DialogService) {

    }

    async activate() {
        await dispatchify(getUserNfts)();
    }

    showNftProperties(properties) {
        this.dialogService.open({ viewModel: NftPropertiesModal, model: properties }).whenClosed(response => {
            //console.log(response);
        });
    }
}
