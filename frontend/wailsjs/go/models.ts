export namespace main {
	
	export class Playlist {
	    name: string;
	    trackPaths: string[];
	
	    static createFrom(source: any = {}) {
	        return new Playlist(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.trackPaths = source["trackPaths"];
	    }
	}
	export class TrackMetadata {
	    filePath: string;
	    durationSec: number;
	    bpm: number;
	    keySignature: string;
	    waveform: number[];
	
	    static createFrom(source: any = {}) {
	        return new TrackMetadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.filePath = source["filePath"];
	        this.durationSec = source["durationSec"];
	        this.bpm = source["bpm"];
	        this.keySignature = source["keySignature"];
	        this.waveform = source["waveform"];
	    }
	}

}

