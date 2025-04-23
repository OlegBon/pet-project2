<script>
  // Локальні змінні для міст
  export let city = "";
  export let cities = [];
  export let selectedCityRef = "";

  // Локальні змінні для відділень
  export let branch = "";
  export let branches = [];
  export let selectedBranchRef = "";

  async function fetchCities(event) {
    const searchValue = event.target.value;

    if (searchValue.length < 3) {
      cities = [];
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/nposhta/cities?findByCity=${encodeURIComponent(searchValue)}`
      );
      const data = await response.json();

      if (data.success) {
        cities = data.data;
      } else {
        cities = [];
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      cities = [];
    }
  }

  function selectCity(selectedCity) {
    city = selectedCity.Description;
    selectedCityRef = selectedCity.Ref;
    cities = [];
    branches = []; // Очищення відділень після зміни міста
  }

  async function fetchBranches(event) {
    const searchValue = event.target.value;

    if (searchValue.length < 1) {
      branches = [];
      return;
    }

    const url = `http://127.0.0.1:8000/api/nposhta/branches?cityRef=${encodeURIComponent(selectedCityRef)}&findByBranch=${encodeURIComponent(searchValue)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        branches = data.data;
      } else {
        branches = [];
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      branches = [];
    }
  }

  function selectBranch(selectedBranch) {
    branch = `${selectedBranch.Description}, No. ${selectedBranch.Number}`;
    selectedBranchRef = selectedBranch.Ref;
    branches = [];
  }
</script>

<div>
  <!-- Поле для вибору міста -->
  <div class="q-mb-md">
    <label for="city">City:</label>
    <input
      id="city"
      type="text"
      bind:value={city}
      on:input="{fetchCities}"
      placeholder="Your city"
      class="input input-bordered w-full"
    />
    {#if cities.length > 0}
      <ul class="city-list">
        {#each cities as city}
          <li on:click={() => selectCity(city)}>{city.Description}</li>
        {/each}
      </ul>
    {/if}
  </div>

  <!-- Поле для вибору відділення, з'являється лише після вибору міста -->
  {#if selectedCityRef}
    <div class="q-mb-md">
      <label for="branch">Branch:</label>
      <input
        id="branch"
        type="text"
        bind:value={branch}
        on:input="{fetchBranches}"
        placeholder="Your branch/address"
        class="input input-bordered w-full"
      />
      {#if branches.length > 0}
        <ul class="branch-list">
          {#each branches as branch}
            <li on:click={() => selectBranch(branch)}>
              {branch.Description}, No. {branch.Number}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>