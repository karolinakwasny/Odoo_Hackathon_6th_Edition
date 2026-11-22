import { useState } from "react";
import { notify } from "../../utils/notify";
import { useUserStore } from "../../store/userStore";
import { useProjectStore } from "../projects/data/projectStore";
import ComputeGlobe from "../../components/globe/ComputeGlobe";

const countries: Record<string, string> = {
  Germany: "Germany",
  France: "France",
  Denmark: "Denmark",
  Poland: "Poland",
  Norway: "Norway",
  Spain: "Spain",
  Portugal: "Portugal",
  "United Kingdom": "United Kingdom",
  "United States": "United States of America",
  Brazil: "Brazil",
  Canada: "Canada",
  India: "India",
  Japan: "Japan",
  Australia: "Australia",
  "South Africa": "South Africa",
};
const countryCodes: Record<string, string> = {
  Germany: "DE",
  France: "FR",
  Denmark: "DK",
  Poland: "PL",
  Norway: "NO",
  Spain: "ES",
  Portugal: "PT",
  "United Kingdom": "GB",
  "United States": "US",
  Brazil: "BR",
  Canada: "CA",
  India: "IN",
  Japan: "JP",
  Australia: "AU",
  "South Africa": "ZA",
};
const interestOptions = [
  "Climate & Environment",
  "Biodiversity & Ecosystems",
  "Scientific Research",
  "Open Source & Public Infrastructure",
  "Space & Astronomy",
  "Social Good",
  "Education",
];

export function AccountPage() {
  const store = useUserStore();
  const allProjects = useProjectStore((state) => state.projects);
  const joinedProjects = allProjects.filter((project) =>
    store.joinedProjectIds.includes(project.id),
  );
  const [editing, setEditing] = useState(false);
  const [draftCountry, setDraftCountry] = useState(store.country);
  const [draftName, setDraftName] = useState(
    store.displayName || store.username,
  );

  function saveProfile() {
    if (!draftName.trim()) return;
    store.setProfile({ displayName: draftName.trim(), country: draftCountry });
    setEditing(false);
    notify(
      "Account updated",
      "Your profile changes were saved locally.",
      "green",
    );
  }

  return (
    <div className="account-page">
      <div className="account-layout">
        {/* LEFT: PROFILE */}
        <section className="account-profile-card">
          <div className="account-identity">
            {editing ? (
              <label className="native-field">
                Display name
                <input
                  value={draftName}
                  onChange={(event) => setDraftName(event.currentTarget.value)}
                />
              </label>
            ) : (
              <>
                <span>Contributor</span>
                <h2>{store.displayName || store.username}</h2>
                <p>@{store.username}</p>
              </>
            )}

          </div>
          <span className="account-section-label">Interests</span>

          {editing ? (
            <div className="native-check-grid">
              {interestOptions.map((interest) => (
                <label className="native-check" key={interest}>
                  <input
                    type="checkbox"
                    checked={store.interests.includes(
                      interest as (typeof store.interests)[number],
                    )}
                    onChange={() =>
                      store.updateInterests(
                        store.interests.includes(
                          interest as (typeof store.interests)[number],
                        )
                          ? store.interests.filter((item) => item !== interest)
                          : [
                              ...store.interests,
                              interest as (typeof store.interests)[number],
                            ],
                      )
                    }
                  />
                  <span>{interest}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="profile-tags">
              {store.interests.length ? (
                store.interests.map((interest) => (
                  <span className="native-badge" key={interest}>
                    {interest}
                  </span>
                ))
              ) : (
                <span className="muted-copy">No interests selected</span>
              )}
            </div>
          )}
            <button
              className="native-button"
              type="button"
              onClick={() => (editing ? saveProfile() : setEditing(true))}
            >
              {editing ? "Save changes" : "Edit account"}
            </button>
          {/* GLOBE: PART OF THE PROFILE */}
        </section>

        {/* RIGHT: ACCOUNT DETAILS */}
        <section className="account-details">
          <article className="account-section"><span className="account-section-label">My projects</span>

            {joinedProjects.length ? (
              <div className="account-project-list">
                {joinedProjects.map((project) => (
                  <div key={project.id}>
                    <span>{project.category}</span>
                    <strong>{project.name}</strong>
                    <span className="native-badge">
                      {store.activeProjectIds.includes(project.id)
                        ? "Contributing"
                        : "Added"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted-copy">No projects added yet.</p>
            )}</article>

          <article className="account-profile-card">
            <span className="account-section-label">Contribution region</span>

            <div className="account-country">
              {editing ? (
                <label className="native-field">
                  Contribution region
                  <select
                    className="native-select"
                    value={draftCountry}
                    onChange={(event) =>
                      setDraftCountry(event.currentTarget.value)
                    }
                  >
                    {Object.keys(countries).map((country) => (
                      <option key={country}>{country}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <>
                  <strong>{store.country || "Not selected"}</strong>
                </>
              )}
              <div className="account-profile-globe">
                <ComputeGlobe
                  compact
                  selectedCountryCode={
                    countryCodes[draftCountry] ||
                    countryCodes[store.country] ||
                    undefined
                  }
                  showControls={false}
                  showDetailPanel={false}
                  onCountrySelect={(code: string | null) => {
                    if (!editing) return;

                    const reverse = Object.entries(countryCodes).find(
                      ([, countryCode]) => countryCode === code,
                    );

                    if (reverse) setDraftCountry(reverse[0]);
                  }}
                />
              </div>
            </div>
          </article>

          <article className="account-section">
            <span className="account-section-label">My computer</span>

            <div className="computer-summary-row">
              <div>
                <span>Device</span>
                <strong>{store.deviceType}</strong>
              </div>
              <div>
                <span>CPU limit</span>
                <strong>{store.cpuUsage}%</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>
                  {store.contributionEnabled
                    ? "Contribution active"
                    : "Stopped"}
                </strong>
              </div>
            </div>
          </article>

          <article className="account-section">
            
          </article>
        </section>
      </div>
    </div>
  );
}
