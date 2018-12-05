import PropTypes from 'prop-types';
import { extent as d3Extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { select as d3Select } from 'd3-selection';
import cloudLayout from 'd3-cloud';
import { CategoricalColorNamespace } from '@superset-ui/color';

const ROTATION = {
  flat: () => 0,
  /* eslint-disable-next-line no-magic-numbers */
  random: () => Math.floor(Math.random() * 6 - 3) * 30,
  /* eslint-disable-next-line no-magic-numbers */
  square: () => Math.floor(Math.random() * 2) * 90,
};

const propTypes = {
  colorScheme: PropTypes.string,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      size: PropTypes.number,
      text: PropTypes.string,
    }),
  ),
  height: PropTypes.number,
  rotation: PropTypes.string,
  sizeRange: PropTypes.arrayOf(PropTypes.number),
  width: PropTypes.number,
};

function WordCloud(element, props) {
  const { data, width, height, rotation, sizeRange, colorScheme } = props;

  const chart = d3Select(element);
  const size = [width, height];
  const rotationFn = ROTATION[rotation] || ROTATION.flat;

  const scale = scaleLinear()
    .range(sizeRange)
    .domain(d3Extent(data, d => d.size));

  const layout = cloudLayout()
    .size(size)
    .words(data)
    /* eslint-disable-next-line no-magic-numbers */
    .padding(5)
    .rotate(rotationFn)
    .font('Helvetica')
    .fontWeight('bold')
    .fontSize(d => scale(d.size));

  const colorFn = CategoricalColorNamespace.getScale(colorScheme);

  function draw(words) {
    chart.selectAll('*').remove();

    const [w, h] = layout.size();

    chart
      .append('svg')
      .attr('width', w)
      .attr('height', h)
      .append('g')
      .attr('transform', `translate(${w / 2},${h / 2})`)
      .selectAll('text')
      .data(words)
      .enter()
      .append('text')
      .style('font-size', d => `${d.size}px`)
      .style('font-weight', 'bold')
      .style('font-family', 'Helvetica')
      .style('fill', d => colorFn(d.text))
      .attr('text-anchor', 'middle')
      .attr('transform', d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
      .text(d => d.text);
  }

  layout.on('end', draw).start();
}

WordCloud.displayName = 'WordCloud';
WordCloud.propTypes = propTypes;

export default WordCloud;