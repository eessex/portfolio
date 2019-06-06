import { clone } from "lodash"
import { getVenue } from "../index"
import * as fixtures from "client/tests/fixtures/components"

describe("utils", () => {
  describe("#getVenue", () => {
    it("Renders a venue with all fields", () => {
      expect(getVenue(fixtures.venue)).toBe("National Arts Club, New York, NY, USA")
    })

    it("Renders an international venue", () => {
      expect(getVenue(fixtures.internationVenue)).toBe("Kulturzentrum Alter Schlachthof, Eupen, Belguim")
    })

    it("Renders a venue with no name", () => {
      const venue = clone(fixtures.venue)
      delete venue.name
      expect(getVenue(venue)).toBe("15 Gramercy Park S., New York, NY, USA")
    })

    it("Renders a venue with no address", () => {
      const venue = clone(fixtures.venue)
      delete venue.address
      expect(getVenue(venue)).toBe("National Arts Club, New York, NY, USA")
    })

    it("Renders a venue with no state", () => {
      const venue = clone(fixtures.venue)
      delete venue.state
      expect(getVenue(venue)).toBe("National Arts Club, New York, USA")
    })

    it("Renders a venue with no city", () => {
      const venue = clone(fixtures.venue)
      delete venue.city
      expect(getVenue(venue)).toBe("National Arts Club, NY, USA")
    })

    it("Renders a venue with no country", () => {
      const venue = clone(fixtures.venue)
      delete venue.country
      expect(getVenue(venue)).toBe("National Arts Club, New York, NY")
    })
  })
})