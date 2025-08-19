//import fs from 'fs';
//import path from 'path';
//import { LogMe, jPackConfig, removeEmptyDirs } from 'jizy-packer';

const jPackData = {
    name: 'jStorage',
    alias: 'jizy-storage',
    cfg: 'storage',
    assetsPath: 'dist',

    buildTarget: null,
    buildZip: false,
    buildName: 'default',

    onCheckConfig: () => { },

    onGenerateBuildJs: (code) => code,

    onGenerateWrappedJs: (wrapped) => wrapped,

    onPacked: () => { }
};

export default jPackData;

