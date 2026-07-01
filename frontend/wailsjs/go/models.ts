export namespace backend {
	
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
	export class SoundCloudResult {
	    title: string;
	    uploader: string;
	    url: string;
	    duration: number;
	
	    static createFrom(source: any = {}) {
	        return new SoundCloudResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.uploader = source["uploader"];
	        this.url = source["url"];
	        this.duration = source["duration"];
	    }
	}
	export class TrackMetadata {
	    filePath: string;
	    durationSec: number;
	    bpm: number;
	    keySignature: string;
	    waveform: number[];
	    artist: string;
	    genre: string;
	    mood: string;
	
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
	        this.artist = source["artist"];
	        this.genre = source["genre"];
	        this.mood = source["mood"];
	    }
	}

}

