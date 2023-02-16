type BoxData = [number, number, number][];
type MinMax = { min: number, max: number };

export class Box {
    private data: BoxData; // it's all about the data
    private box: MinMax[]; // the bounding box of the data
    private dim = 3; // number of dimensions in the data, currently fixed to 3 to handle RGB

    constructor(data: BoxData) {
        this.data = data;
        this.box = this.calculate_bounding_box();
    }

    private is_nan() {
        return isNaN(this.data[0][0]) || isNaN(this.data[0][1]) || isNaN(this.data[0][2]);
    }

    private calculate_bounding_box() {

        // keeps running tally of the min and max values on each dimension
        // initialize the min value to the highest number possible, and the
        // max value to the lowest number possible

        let minmax = [{min: Number.MAX_VALUE, max: Number.MIN_VALUE},
            {min: Number.MAX_VALUE, max: Number.MIN_VALUE},
            {min: Number.MAX_VALUE, max: Number.MIN_VALUE}];

        for (let i = this.data.length - 1; i >= 0; i -= 1) {
            minmax[0].min = (this.data[i][0] < minmax[0].min) ?
                this.data[i][0] : minmax[0].min; // r
            minmax[1].min = (this.data[i][1] < minmax[1].min) ?
                this.data[i][1] : minmax[1].min; // g
            minmax[2].min = (this.data[i][2] < minmax[2].min) ?
                this.data[i][2] : minmax[2].min; // b

            minmax[0].max = (this.data[i][0] > minmax[0].max) ?
                this.data[i][0] : minmax[0].max; // r
            minmax[1].max = (this.data[i][1] > minmax[1].max) ?
                this.data[i][1] : minmax[1].max; // g
            minmax[2].max = (this.data[i][2] > minmax[2].max) ?
                this.data[i][2] : minmax[2].max; // b
        }

        return minmax;

    }

    public get_data() {
        return this.data;
    }

    private get_longest_axis() {

        // Returns the longest (aka 'widest') axis of the data in this box.

        let longest_axis = 0;
        let longest_axis_size = 0;
        let axis_size;

        for (let i = this.dim - 1; i >= 0; i -= 1) {
            axis_size = this.box[i].max - this.box[i].min;
            if (axis_size > longest_axis_size) {
                longest_axis = i;
                longest_axis_size = axis_size;
            }
        }

        return {axis: longest_axis, length: longest_axis_size};
    }

    private get_comparison_func(_i: number) {

        // Return a comparison function based on a given index (for median-cut,
        // sort on the longest axis) ie: sort ONLY on a single axis.
        // get_comparison_func( 1 ) would return a sorting function that sorts
        // the data according to each item's Green value.

        return  function (a: number[], b: number[]) {
            return a[_i] - b[_i];
        };
    }

    private sort() {
        let longest_axis = this.get_longest_axis();
        let sort_method = this.get_comparison_func(longest_axis.axis);
        this.data.sort(sort_method);
    }

    public mean_pos() {
        let mean_i;
        let mean = 0;
        let smallest_diff = Number.MAX_VALUE;
        let axis = this.get_longest_axis().axis;
        let diff;

        // sum all the data along the longest axis...
        for (let i = this.data.length - 1; i >= 0; i -= 1) {
            mean += this.data[i][axis];
        }
        mean /= this.data.length;

        // find the data point that is closest to the mean
        for (let i = this.data.length - 1; i >= 0; i -= 1) {
            diff = Math.abs(this.data[i][axis] - mean);
            if (diff < smallest_diff) {
                smallest_diff = diff;
                mean_i = i;
            }
        }

        // return the index of the data point closest to the mean

        return mean_i;
    }

     public split() {

            // Splits this box in two and returns two box objects. This function
            // represents steps 2 and 3 of the algorithm, as written at the top
            // of this file.

            this.sort();

            let med   = this.mean_pos();
            let data1 = Array.prototype.slice.call( this.data, 0, med ); // elements 0 through med
            let data2 = Array.prototype.slice.call( this.data, med );    // elements med through end
            let box1  = new Box(data1);
            let box2  = new Box(data2);

            return [ box1, box2 ];

        }

          public average() {

            // Returns the average value of the data in this box

            let avg_r = 0;
            let avg_g = 0;
            let avg_b = 0;
            let i;

            for( i = this.data.length - 1; i >= 0; i -= 1 ) {
                avg_r += this.data[i][0];
                avg_g += this.data[i][1];
                avg_b += this.data[i][2];
            }

            avg_r /= this.data.length;
            avg_g /= this.data.length;
            avg_b /= this.data.length;

            return [ avg_r, avg_g, avg_b];

        }

         private median_pos() {

            // Returns the position of the median value of the data in
            // this box.  The position number is rounded down, to deal
            // with cases when the data has an odd number of elements.

            return Math.floor( this.data.length / 2 );

        }

         public is_empty() {

            // Self-explanatory

            return this.data.length === 0;
        }

         public is_splittable() {

            // A box is considered splittable if it has two or more items.

            return this.data.length >= 2;
        }

         public get_bounding_box() {
            // Getter for the bounding box
            return this.box;
        }

}