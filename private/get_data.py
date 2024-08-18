import multiversx_utils as mu
import json
import os

data_folder_path = '../public/data'
collections = ['CRMYTH-546419', 'CRWEAPONS-e5ab49', 'GSPACEAPE-08bc2b', 'CEA-2d29f9', 'CRHEROES-9edff2']
operations = {
    'info': True,
    'nfts_raw': True,
    'nfts_processed': True,
    'txs': False
}
params = {
    'CRMYTH-546419': {
        'sleep_time': 0.6,
        'whitelist': ['https://metadata.cantinaroyale.io/dynamic/']
    },
    'CRWEAPONS-e5ab49': {
        'sleep_time': 0.6,
        'whitelist': ['https://metadata.cantinaroyale.io/dynamic/']
    },
    'GSPACEAPE-08bc2b': {
        'sleep_time': 0.2,
        'whitelist': ['https://metadata.verko.io/dynamic/']
    },
    'CEA-2d29f9': {
        'sleep_time': 0.2,
        'whitelist': ['https://metadata.verko.io/dynamic/']
    },
    'CRCHAMPS-d0265d': {
        'sleep_time': 0.6,
        'whitelist': ['https://metadata.cantinaroyale.io/dynamic/', 'https://metadata.cantinaroyale.io/metadata/']
    },
    'CRHEROES-9edff2': {
        'sleep_time': 0.6,
        'whitelist': ['https://metadata.cantinaroyale.io/dynamic/', 'https://metadata.cantinaroyale.io/metadata/']
    },
    'EAPES-8f3c1f': {
        'sleep_time': 0,
        'whitelist': []
    }
}

def get_collection_info(collection_name, collection_folder_path):
    collection_info = mu.get_collection_info(collection_name)
    filename = os.path.join(collection_folder_path, 'info.json')
    with open(filename, 'w') as f:
        json.dump(collection_info, f, indent=4)
    return

def get_collection_nfts_raw(collection_name, collection_folder_path, sleep_time, whitelist):
    collection_nfts = mu.get_collection_nfts(collection_name)
    collection_offchain_data = mu.get_collection_offchain_data(collection_nfts, sleep_time=sleep_time, whitelist=whitelist)
    for identifier in collection_nfts:
        collection_nfts[identifier]['offchainData'] = collection_offchain_data[identifier]
    filename = os.path.join(collection_folder_path, 'nfts_raw.json')
    with open(filename, 'w') as f:
        json.dump(collection_nfts, f, indent=4)
    return

def get_collection_nfts_processed(collection_name, collection_folder_path):
    filename = os.path.join(collection_folder_path, 'nfts_raw.json')
    with open(filename, 'r') as f:
        collection_nfts = json.load(f)
    collection_nfts_processed = {}
    for identifier, nft in collection_nfts.items():
        collection_nfts_processed[identifier] = mu.parse_nft_data(nft)
    filename = os.path.join(collection_folder_path, 'nfts.json')
    with open(filename, 'w') as f:
        json.dump(collection_nfts_processed, f, indent=4)
    os.remove(os.path.join(collection_folder_path, 'nfts_raw.json'))
    return

def get_collection_txs(collection_name, collection_folder_path):
    collection_txs = mu.get_collection_txs(collection_name)
    filename = os.path.join(collection_folder_path, 'txs.json')
    with open(filename, 'w') as f:
        json.dump(collection_txs, f, indent=4)
    return

for collection_name in collections:
    collection_folder_path = os.path.join(data_folder_path, collection_name)
    if not os.path.exists(collection_folder_path):
        os.makedirs(collection_folder_path)
    if operations['info']:
        get_collection_info(collection_name, collection_folder_path)
    if operations['nfts_raw']:
        get_collection_nfts_raw(collection_name, collection_folder_path, params[collection_name]['sleep_time'], params[collection_name]['whitelist'])
    if operations['nfts_processed']:
        get_collection_nfts_processed(collection_name, collection_folder_path)
    if operations['txs']:
        get_collection_txs(collection_name, collection_folder_path)
