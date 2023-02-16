type RGB = [number, number, number];
import {Box} from "./Box";

export class MCut {
    private boxes: Box[] = [];
    private data: RGB[] = [];

    private initBoxes(_data: RGB[]) {
        if (_data.length > 0) {
            const box1 = new Box(_data);
            this.boxes = [box1];
            return true;
        } else {
            return false;
        }
    }

    constructor(data: RGB[]) {
        this.data = data;
        this.initBoxes(data);
    }

     private static is_valid_data( _data ) {
            return _data.length > 0;
        }


    private getLongestBoxIndex() {
        let longestBoxIndex = 0;

        for (let i = this.boxes.length - 1; i >= 0; i--) {
            if (this.boxes[i].get_bounding_box() > this.boxes[longestBoxIndex].get_bounding_box()) {
                longestBoxIndex = i;
            }
        }
        return longestBoxIndex;
    }

    private getBoxes() {
        return this.boxes;
    }

    public getFixedSizePalette(numColors: number) {
        if(this.boxes.length === 0) {
            return [];
        }
        let longestBoxIndex = 0;
        let splitBoxes;
        let values = [];

        for(let i = numColors - 1; i > 0; i--){
            const longestBoxIndex = this.getLongestBoxIndex();
            const box_to_split = this.boxes.splice(longestBoxIndex, 1)[0];
            if(box_to_split.is_splittable()){
                splitBoxes = box_to_split.split();
                this.boxes.push(splitBoxes[0], splitBoxes[1]);
            }else{
                this.boxes.push(box_to_split, box_to_split);
            }
        }

        for (let i = numColors - 1; i >= 0; i--) {
            values.push(this.boxes[i].average());
        }
        return values;
    }

}